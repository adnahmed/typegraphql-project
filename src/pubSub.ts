import { RedisPubSub } from 'graphql-redis-subscriptions';
import { RedisOptions } from 'ioredis';
import Redis from 'ioredis';
import env from './env';
import { PubSubEngine } from 'type-graphql';
import { Logger } from './extensions/logger.service';
export default function bootstrap(): PubSubEngine {
    const logger = new Logger();
    const options: RedisOptions = {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        retryStrategy: times => Math.max(times * env.REDIS_RETRY_LIMIT, env.REDIS_RETRY_TIMEOUT),
    }
    const errorHandler = (type: string, message: string) => logger.log('error',`redis: ${type} failed to connect, error: ${message}`)
    const pubSub = new RedisPubSub({
        publisher: new Redis(options).on('error', (error: Error) => errorHandler('publisher', error.message)),
        subscriber: new Redis(options).on('error', (error: Error) => errorHandler('subscriber', error.message))
    })
    return pubSub;
}