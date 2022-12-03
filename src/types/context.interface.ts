import { PrismaClient } from "@prisma/client";
import { User } from '@generated/type-graphql';
import { BaseContext } from "@apollo/server";
import { FastifyRequest } from 'fastify';

interface Context extends BaseContext {
    user?: User
    prisma: PrismaClient
    req: FastifyRequest
}

export default Context;