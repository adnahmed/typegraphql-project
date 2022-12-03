import { Extensions } from 'type-graphql';
interface LogOptions {
    message: string;
    level?: number;
}

export function LogMessage(messageOrOptions: string | LogOptions) {
    const log: LogOptions = 
        typeof messageOrOptions === 'string' 
        ? {
            level: 4,
            message: messageOrOptions
        }
        : messageOrOptions;

    return Extensions({ log });
}