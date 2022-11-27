import "reflect-metadata";
import {buildSchema} from "type-graphql";
import {ApolloServer} from '@apollo/server'
import {ApolloServerPluginLandingPageLocalDefault} from '@apollo/server/plugin/landingPage/default'
import {startStandaloneServer} from '@apollo/server/standalone'
import { Container } from 'typedi'
import env from './env'

import RecipeResolver, {RecipeNotFoundError} from "./Recipe";

(async () => {
    const schema = await buildSchema({
        resolvers: [RecipeResolver],
        orphanedTypes: [RecipeNotFoundError],
        container: Container,
    })

    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        introspection: true,
        plugins: [ApolloServerPluginLandingPageLocalDefault()]
    })

    startStandaloneServer(server, {
        listen: {port: env.PORT}
    })
})();

