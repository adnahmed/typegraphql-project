import { Arg, ClassType, Int, Query, Resolver } from "type-graphql";

export default function createBaseResolver<T extends ClassType>(suffix: string, objectTypeCls: T) {
    @Resolver({ isAbstract: true })
    abstract class BaseResolver {
        protected items: T[] = [];
        // eslint-disable-next-line type-graphql/wrong-decorator-signature
        @Query(type => [objectTypeCls], { name: `getAll${suffix}`})
        getAll(@Arg("first", type => Int) first: number): T[] {
            return this.items.slice(0, first);
        }
    }
    return BaseResolver;
}