import { cleanEnv, num, str } from 'envalid'
const isDevelopment = process.env.NODE_ENV === 'development'
const env = cleanEnv(process.env, {
    PORT: num({ default: 4000 }),
    JWT_SECRET: str({ default: isDevelopment ? 'mysecret' : null }),
    SALT_ROUNDS: num({ default: 10 }),
    REDIS_HOST: str({ default: isDevelopment ? 'localhost' : null }),
    REDIS_PORT: num({ default: 6379 }),
    REDIS_RETRY_LIMIT: num({ default: isDevelopment ? 1 : 100 }),
    REDIS_RETRY_TIMEOUT: num({ default: 3000 })
})

export default env;