import { Service } from 'typedi'

@Service()
export class Logger {
    log(level, ...args: any[]) {
        level === 'error'
            ? console.error(...args)
            : console.log(...args);
    }
}