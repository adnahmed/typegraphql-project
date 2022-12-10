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
import rateLimit, { RateLimitPluginOptions } from '@fastify/rate-limit'
import helmet, { FastifyHelmetOptions } from '@fastify/helmet'
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify'

import env from './env'
import Context from "./Types/context.interface";
import { bootstrap_pubSub, cache } from './redis'
import { UserResolver } from './Resolvers/User';
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
        pubSub: bootstrap_pubSub(),
        authChecker,
    })


    const server = new ApolloServer<Context>({
        schema,
        csrfPrevention: true,
        introspection: true,
        plugins: [
            env.isDev
                ? ApolloServerPluginLandingPageLocalDefault()
                : ApolloServerPluginLandingPageProductionDefault(),
            fastifyApolloDrainPlugin(fastify)
        ]
    })
    await server.start()

    await fastify.register(rateLimit, rateLimitOptions)
    fastify.setNotFoundHandler({
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        preHandler: fastify.rateLimit({
            max: 4,
            timeWindow: 500
        })
    }, function (request, reply) {
        void reply.code(404).send('You have requested an unknown route.')
    })
    await fastify.register(helmet, helmetOptions)
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

const rateLimitOptions: RateLimitPluginOptions = {
    global: true,
    max: 3000,
    timeWindow: 1000, // 1 second,
    allowList: ['127.0.0.1'],
    keyGenerator: (request) =>
        request.headers.authorization !== undefined
            ? request.headers.authorization : request.ip,
    redis: cache.status === 'ready' ? cache : undefined
}

const corsOptions: FastifyCorsOptions = {
    origin: (origin: string, cb) => {
        if (!origin) return cb(null, true)
        const hostname = new URL(origin).hostname
        if (hostname === 'localhost') {
            // Request from localhost will pass
            return cb(null, true)
        }
        cb(new Error("Not allowed"), false)
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true
}

const helmetOptions: FastifyHelmetOptions = {
    contentSecurityPolicy: !env.isDevelopment ? undefined : false,
    crossOriginEmbedderPolicy: false
}