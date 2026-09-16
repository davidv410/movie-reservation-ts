import { Redis } from "ioredis"

export const workerConnection  = new Redis(process.env.REDIS_URL_TCP!, {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    tls: {},
})

export const queueConnection = new Redis(process.env.REDIS_URL_TCP!, {
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    tls: {},
    enableOfflineQueue: false,
});