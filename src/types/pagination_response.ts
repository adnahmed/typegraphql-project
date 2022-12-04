import { GraphQLScalarType } from "graphql";
import { ClassType, Field, Int, ObjectType } from "type-graphql";

export default function PaginatedResponse<TItem>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    TItemClass: ClassType<TItem> | GraphQLScalarType
    ) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    
    @ObjectType(`Paginated${TItemClass.name}Response`)
    abstract class PaginatedResponseClass {
        // eslint-disable-next-line type-graphql/wrong-decorator-signature
        @Field(type => [TItemClass])
        items: TItem[]

        @Field(type => Int)
        total: number

        @Field()
        hasMore: boolean
    }
    return PaginatedResponseClass;
}