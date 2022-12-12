import { Arg, Args, Authorized, Ctx, Field, Int, Mutation, Query, Resolver, ObjectType } from 'type-graphql';
import { User, UserCreateInput } from '@generated/type-graphql'
import Context from '../Types/context.interface';
import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import env from '../env';
import LoginArgs from "../Types/Args/LoginArgs";
import { Prisma } from '@prisma/client';
import { Logger } from '../extensions/logger.service';
@Resolver(of => User)
export class UserResolver {
    logger: Logger
    constructor() {
        this.logger = new Logger();
    }
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
    ): Promise<string> {
        let user: User;
        if (!login.email && !login.mobilePhone) throw new Error("Email or Mobile Phone Number must be provided.")
        if (login.email !== undefined)
            user = await context.prisma.user.findFirst({ where: { email: login.email } })
        else
            user = await context.prisma.user.findFirst({ where: { mobilePhone: login.mobilePhone } });
        // TODO: Follow OWASP Auth CheatSheet for suitable Error Messages
        if (!user) throw new Error('Invalid User ID provided.')
        const isSamePassword = await bcrypt.compare(login.password, user.password)
        if (isSamePassword)
            return jwt.sign({ id: user.id, sub: env.JWT_EXPIRES }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES })
        throw new Error("Invalid User ID or Password provided.")
    }

    @Mutation(returns => String)
    async createAccount(
        @Arg("user") user: UserCreateInput,
        @Ctx() context: Context
    ): Promise<string> {
        if (context.user !== undefined) throw new Error("Authorized users cannot create a new account. Sign out and try again.")
        user.password = await bcrypt.hash(user.password, env.SALT_ROUNDS)
        try {
            const created = await context.prisma.user.create({
                data: { ...user, lastSeen: null }
            })
            return jwt.sign(created.id, env.JWT_SECRET)
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    // TODO: Follow OWASP cheatsheet for error messages
                    this.logger.log(
                        'create Account Failed.'
                    )
                    throw new Error(
                        `A User Account with ${user.email || user.mobilePhone} already exists.`)
                }
            }
        }
    }

    @Mutation(returns => User)
    @Authorized()
    async signOut(
        @Ctx() context: Context
    ): Promise<User> {
        return await context.prisma.user.update({
            where: { id: context.user?.id }, data: {
                lastSeen: 's'
            }
        })
    }
}