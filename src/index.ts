import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServer } from '@apollo/server'
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault
} from '@apollo/server/plugin/landingPage/default'
import path from 'path'
import Fastify from 'fastify'
import compress from '@fastify/compress'
import cors, { FastifyCorsOptions } from '@fastify/cors'
import rateLimit, { RateLimitOptions } from '@fastify/rate-limit'
import helment from '@fastify/helmet'
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify'

import env from './env'
import Context from "./types/context.interface";
import bootstrap from './pubSub'
import { UserResolver } from './models/User';
import authChecker from "./authorization/authChecker";
import getContext from "./extensions/server.context";
import { PinoLoggerOptions } from "fastify/types/logger";

const envToLogger: Record<string, PinoLoggerOptions> = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    },
    production: { level: 'info' },
    test: { level: 'info' }
}

const fastify = Fastify({
    logger: {
        ...envToLogger[env.APP_ENV],
        redact: env.isDevelopment ? undefined : ['req.headers.authorization']
    }
});

void (async () => {
    const schema = await buildSchema({
        resolvers: [UserResolver],
        validate: false,
        orphanedTypes: [],
        emitSchemaFile: path.resolve(__dirname, "schema.graphql"),
        pubSub: bootstrap(),
        authChecker,
    })


    const server = new ApolloServer<Context>({
        schema,
        csrfPrevention: true,
        introspection: true,
        plugins: [
            env.isDev ? ApolloServerPluginLandingPageLocalDefault() : ApolloServerPluginLandingPageProductionDefault(),
            fastifyApolloDrainPlugin(fastify)
        ]
    })
    await server.start()

    await fastify.register(rateLimit, rateLimitOptions)
    await fastify.register(helment)
    await fastify.register(cors, corsOptions)
    await fastify.register(compress)

    await fastify.register(fastifyApollo<Context>(server), {
        context: getContext
    })
    await fastify.listen({
        port: env.PORT,
    })
    console.log(`Server is running, GraphQL Playground available at http://localhost:${env.PORT}/graphql`);
})();

const rateLimitOptions: RateLimitOptions = {}

const corsOptions: FastifyCorsOptions = {
    origin: (origin, cb) => {
        const hostname = new URL(origin).hostname
        if (hostname === 'localhost') {
            // Request from localhost will pass
            cb(null, true)
            return
        }
        cb(new Error("Not allowed"), false)
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}