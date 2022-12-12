import { cleanEnv, num, str } from 'envalid'
const isDevelopment = process.env.NODE_ENV === 'development'
const env = cleanEnv(process.env, {
    APP_ENV: str({ choices: ['development', 'production', 'test'], default: process.env.NODE_ENV }),
    PORT: num({ default: 4000 }),
    JWT_SECRET: str({ default: isDevelopment ? 'mysecret' : undefined }),
    JWT_EXPIRES: str({ default: '7d' }),
    SALT_ROUNDS: num({ default: 10 }),
    REDIS_HOST: str({ default: isDevelopment ? 'localhost' : undefined }),
    REDIS_PORT: num({ default: 6379 }),
    REDIS_RETRY_LIMIT: num({ default: isDevelopment ? 1 : 100 }),
    REDIS_RETRY_TIMEOUT: num({ default: 3000 })
})

export default env;