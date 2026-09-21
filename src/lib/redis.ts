import 'dotenv/config'
import { Redis } from '@upstash/redis'

export const redis = new Redis({ url: process.env.REDIS_URL!, token: process.env.REDIS_TOKEN! })

export const getCache = async <T>(key: string) => {
  if(process.env.ENABLE_CACHE === 'false') return
    try{
      return await redis.get<T>(key)
    }catch(err){
      console.log(err)
    }
}

export const setCache = async (key: string, data: unknown, ttlSeconds = 60) => {
  if(process.env.ENABLE_CACHE === 'false') return
    try{
      await redis.set(key, data, { ex: ttlSeconds })
    }catch(err){
      console.log(err)
    }
}

export const delCache = async (key: string) => {
  if(process.env.ENABLE_CACHE === 'false') return
    try{
      await redis.del(key)
    }catch(err){
      console.log(err)
    }
}