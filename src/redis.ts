import { RedisPubSub } from 'graphql-redis-subscriptions';
import { RedisOptions } from 'ioredis';
import Redis from 'ioredis';
import env from './env';
import { PubSubEngine } from 'type-graphql';
import { Logger } from './extensions/logger.service';

const options: RedisOptions = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    retryStrategy: times =>
        times > env.REDIS_RETRY_LIMIT ?
            null
            : Math.max(times * env.REDIS_RETRY_TIMEOUT, env.REDIS_RETRY_TIMEOUT)
    ,
    connectTimeout: 500,
    maxRetriesPerRequest: 1,
}

const logger = new Logger();
const errorHandler = (type: string, err: Error) => logger.log('error', `redis: ${type} failed to connect, error: ${err.message}`)

export function bootstrap_pubSub(): PubSubEngine {
    const pubSub = new RedisPubSub({
        publisher: new Redis(options).on('error', (err: Error) => errorHandler('publisher', err)),
        subscriber: new Redis(options).on('error', (err: Error) => errorHandler('subscriber', err))
    })
    return pubSub;
}

export const cache = new Redis(options).on('error', err => errorHandler('cache',err))
