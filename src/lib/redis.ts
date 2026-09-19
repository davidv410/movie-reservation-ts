import 'dotenv/config'
import { Redis } from '@upstash/redis'

const rawRedis = new Redis({ url: process.env.REDIS_URL!, token: process.env.REDIS_TOKEN! });

//AI CODE, needed it because i ran out of monthly reqs on upstash and needed a quick solution
export const redis = new Proxy(rawRedis, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value !== "function") return value;

    return (...args: unknown[]) => {
      if (process.env.ENABLE_CACHE === "false") return Promise.resolve(null);
      return Promise.resolve(value.apply(target, args)).catch((err: Error) => {
        console.error(`redis.${String(prop)} failed:`, err.message);
        return null;
      });
    };
  },
});