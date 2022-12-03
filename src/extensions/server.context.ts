import { IncomingMessage } from 'http';
import { PrismaClient } from "@prisma/client";
import * as jwt from 'jsonwebtoken'
import { User } from '@generated/type-graphql'
import { JwtPayload } from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { isString } from "class-validator";
import { FastifyRequest } from 'fastify'
import Context from "../types/context.interface";
import env from '../env'
const prisma = new PrismaClient();
async function getUser(token: string): Promise<User | undefined> {
    function isJwtPayload(payload: string | JwtPayload): payload is JwtPayload {
        return typeof payload === 'object' && payload.sub !== undefined;
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] })
        if (isJwtPayload(decoded)) {
            return await prisma.user.findFirst({ where: { id: decoded.sub } })
        }
        if (isString(decoded))
            return await prisma.user.findFirst({ where: { id: decoded } })
        throw new Error("Unknown Payload Object found in JWT.")
    } catch (err) {
        if (err instanceof Error) {
            throw new GraphQLError(err.message);
        }
    }
}

export default async function getContext(req: FastifyRequest): Promise<Context> {
    let user: undefined | User = undefined
    const authHeader = req.headers.authorization
    const BearerPrefix = 'Bearer '
    const isToken = authHeader && authHeader.startsWith(BearerPrefix)
    if (isToken) {
        const token = authHeader.replaceAll(BearerPrefix, '')
        const isValidToken = new RegExp('^[A-Za-z0-9-.]+$')
        if (!isValidToken.test(token)) {
            throw new Error('Invalid JSON Web Token Provided.')
        }
        user = await getUser(token);
    }
    return {
        req,
        prisma,
        user
    }
}

