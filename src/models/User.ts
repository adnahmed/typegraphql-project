import { Arg, Args, ArgsType, Authorized, Ctx, Field, Int, Mutation, Query, Resolver } from "type-graphql";
import { User, UserCreateInput } from '@generated/type-graphql'
import Context from '../types/context.interface';
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import env from '../env';
import { IsEmail, Length } from "class-validator";

@ArgsType()
class LoginArgs {
    @Field()
    @Length(8)
    password: string

    /* TODO: locale aware mobile phone validation.
    * @IsMobilePhone() 
    */
    // eslint-disable-next-line type-graphql/wrong-decorator-signature
    @Field(type => Int, { nullable: true })
    @Length(10) // TODO: remove this
    mobilePhone?: number

    @Field({ nullable: true })
    @IsEmail()
    email?: string
}

@Resolver(of => User)
export class UserResolver {
    @Query(type => User)
    @Authorized()
    me(
        @Ctx() context: Context
    ) {
        return context.user
    }
    @Query(returns => String)
    async login(
        @Args() login: LoginArgs,
        @Ctx() context: Context
    ) {
        let user: User;
        if (!login.email && !login.mobilePhone) throw new Error("Email or Mobile Phone Number must be provided.")
        if (login.email !== undefined)
            user = await context.prisma.user.findFirst({ where: { email: login.email } })
        else
            user = await context.prisma.user.findFirst({ where: { mobilePhone: login.mobilePhone } });
        if (!user) throw new Error('Invalid User ID provided.')
        const isSamePassword = await bcrypt.compare(login.password, user.password)
        if (isSamePassword)
            return jwt.sign(user.id, env.JWT_SECRET)
        throw new Error("Invalid User ID or Password provided.")
    }

    @Mutation(returns => String)
    async createAccount(
        @Arg("user") user: UserCreateInput,
        @Ctx() context: Context
    ) {
        if (context.user !== undefined) throw new Error("Authorized users cannot create a new account. Sign out and try again.")
        user.password = await bcrypt.hash(user.password, env.SALT_ROUNDS)
        const created = await context.prisma.user.create({
            data: { ...user }
        })
        return jwt.sign(created.id, env.JWT_SECRET)
    }
}