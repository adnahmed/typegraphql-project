import { ArrayMaxSize, Length, Max, Min, MaxLength } from "class-validator";
import {
    Arg,
    Args,
    Authorized,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Ctx,
    InputType,
    ArgsType,
} from "type-graphql";
import { Int, ID } from "type-graphql";
import { Inject, Service } from "typedi";

class User {
    @Field(type => ID)
    id: string;
    @Field()
    name: string;
    @Field({ nullable: true })
    expert?: boolean
}

@ObjectType()
class Rate {
    @Field(type => Int)
    value: number

    @Field()
    date: Date;

    user: User;
}

@ObjectType({ description: 'The recipe model' })
class Recipe {
    @Field(type => String)
    id: string = '1'
    @Field({ description: 'The title of the recipe' })
    title: string = 'Title'
    @Field(type => [Rate])
    ratings: Rate[] = []
    @Field({ nullable: true })
    averageRating(@Arg("since") sinceDate: Date): number | null {
        const ratings = this.ratings.filter(rate => rate.date > sinceDate);
        if (!ratings.length) return null;
        const ratingSum = ratings.reduce((prev, curr) => prev + curr.value, 0)
    }
}

@Service<Recipe[]>()
class RecipieService {
    @Inject("SAMPLE_RECIPES")
    private readonly items: Recipe[]

    async getAll() {
        return this.items;
    }

    async getOne(id: string) {
        return this.items.find(item => item.id === id)
    }

    findById(id: string) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(new Recipe())
            }, 1000)
        })
    }

    removeById(id: string) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true)
            }, 1000)
        })
    }

    addNew({ data: NewRecipeInput, user: User }) {
        return new Promise<Recipe>((resolve) => {
            setTimeout(() => {
                resolve(new Recipe())
            }, 1000);
        })
    }

    findAll(recipeArgs: RecipeArgs) {
        return [new Recipe(), new Recipe()]
    }
}

@ArgsType()
class RecipeArgs {

    @Field(type => Int, { defaultValue: 0 })
    @Min(0)
    skip: number

    @Field(type => Int)
    @Min(1)
    @Max(50)
    take: number = 25

    @Field({ nullable: true })
    title?: string;

}
@InputType({ description: "New recipe data" })
class NewRecipeInput implements Partial<Recipe> {
    @Field()
    @MaxLength(30)
    title: string = 'newRecipe'

    @Field({ nullable: true })
    @Length(30, 255)
    description?: string

    @Field(type => [String])
    @ArrayMaxSize(30)
    ingredients: string[]
}

@ArgsType()
class AddRecipeArgs {
    @Field(type => NewRecipeInput)
    newRecipeData: NewRecipeInput
}



enum Roles {
    Admin
}

export class RecipeNotFoundError extends Error {
    constructor(id: string) {
        super()
        this.message = `Error Retrieveing Recipe for id: ${id}. Recipe was not Found.`
        this.name = 'RecipeNotFoundError'
    }
}

@Service()
@Resolver(of => Recipe)
export default class RecipieResolver {
    constructor(
        // constuction injection of a service
        private recipieService: RecipieService,
    ) {
    }

    @Query(returns => Recipe, { nullable: true })
    async recipe(@Arg("id") id: string) {
        const recipe = await this.recipieService.findById(id);
        if (recipe === undefined) {
            throw new RecipeNotFoundError(id);
        }
        return recipe;
    }

    @Query(returns => [Recipe], { nullable: "itemsAndList"})
    recipes(@Args() { skip, take }: RecipeArgs) {
        return this.recipieService.findAll({ skip, take });
    }

    @Mutation(returns => Recipe)
    // @Authorized()
    addRecipe(
        @Args() { newRecipeData }: AddRecipeArgs,
        @Ctx("user") user
    ): Promise<Recipe> {
        return this.recipieService.addNew({ data: newRecipeData, user });
    }

    @Mutation(returns => Boolean)
    // @Authorized(Roles.Admin)
    async removeRecipe(@Arg("id") id: string) {
        try {
            await this.recipieService.removeById(id);
            return true;
        } catch {
            return false;
        }
    }
}