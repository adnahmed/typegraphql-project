import { ObjectType, Field, ID } from "type-graphql";
import { EmailAddressResolver, GraphQLEmailAddress } from 'graphql-scalars'
import { Country } from './types/country';

@ObjectType()
class User {
    @Field(type => ID)
    id: string;
    @Field()
    first_name: string;
    @Field()
    last_name: string;
    @Field()
    isExpert?: boolean
    @Field()
    isAdmin?: boolean
    @Field({ nullable: true })
    mobilePhone: number
    @Field(type => EmailAddressResolver, { nullable: true })
    email: string
    @Field()
    address: string
    @Field()
    country: Country
    @Field()
    city: string
}