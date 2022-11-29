import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default'
import { startStandaloneServer } from '@apollo/server/standalone'
import { Container } from 'typedi'
import path from 'path'
import env from './env'
import Country from "./types/country";
import { CountryScalar } from "./scalars/country";

(async () => {
    const schema = await buildSchema({
        resolvers: [],
        orphanedTypes: [],
        container: Container,
        emitSchemaFile: path.resolve(__dirname, "schema.gql"),
        scalarsMap: [{ type: Country, scalar: CountryScalar }]
    })

    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        introspection: true,
        plugins: [
            env.isDev ? ApolloServerPluginLandingPageLocalDefault() : ApolloServerPluginLandingPageProductionDefault()
        ]
    })
    // declare route for batch query

    const { url } = await startStandaloneServer(server, {
        listen: { port: env.PORT }
    })
    console.log(`Server is running, GraphQL Playground available at ${url}`);
})();

