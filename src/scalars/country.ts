import { GraphQLScalarType, Kind } from "graphql";
import Country, { Country as AllCountries } from "../types/country";

export const CountryScalar = new GraphQLScalarType({
    name: "Country",
    description: "Country of residence",
    serialize(country: Country): string { // Convert outgoing Date to string for JSON
        return country.value ; // value sent to the client
    },
    parseValue(value: string): Country {
        if (!AllCountries[value])
            throw new Error("CountryScalar can only parse Country Names")
        return new Country(AllCountries[value]); // value from the client input variables
    },
    parseLiteral(ast): Country {
        if (ast.kind !== Kind.STRING) {
            throw new Error("CountryScalar can only parse string values");
        }
        return new Country(AllCountries[ast.value]); // value from the client query
    },
});