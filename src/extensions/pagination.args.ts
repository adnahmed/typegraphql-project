import { ArgsType, Field, Int } from "type-graphql";

@ArgsType()
export default class PaginationArgs {
    @Field(type => Int)
    skip = 0;

    @Field(type => Int)
    take = 25;
}