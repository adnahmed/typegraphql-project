import { cleanEnv, num } from 'envalid'

const env = cleanEnv(process.env,{
    PORT: num({default: 4000})
})

export default env;