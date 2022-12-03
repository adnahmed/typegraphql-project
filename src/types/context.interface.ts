import { PrismaClient } from "@prisma/client";
import { User } from '@generated/type-graphql';
import { IncomingMessage } from 'http'

interface Context {
    user?: User
    prisma: PrismaClient
    req: IncomingMessage
}

export default Context;