import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServer } from '@apollo/server'
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault
} from '@apollo/server/plugin/landingPage/default'
import { startStandaloneServer } from '@apollo/server/standalone'
import path from 'path'
import env from './env'
import Context from "./types/context.interface";
import bootstrap from './pubSub'
import { UserResolver } from './models/User';
import authChecker from "./authorization/authChecker";
import getContext from "./extensions/server.context";


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
            env.isDev ? ApolloServerPluginLandingPageLocalDefault() : ApolloServerPluginLandingPageProductionDefault()
        ]
    })

    const { url } = await startStandaloneServer<Context>(server, {
        context: ({req}) => getContext(req),
        listen: { port: env.PORT }
    })
    console.log(`Server is running, GraphQL Playground available at ${url}`);
})();
