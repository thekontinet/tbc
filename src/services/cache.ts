import config from "../config";
import {createClient} from "redis";
import RedisClient, { RedisClientType } from "@redis/client/dist/lib/client";

interface CacheDriver {
    set(key: string, value: any, ttl?: number): Promise<any>;
    get(key: string, result: any | null): Promise<any>;
    has(key: string): Promise<number>;
    delete(key: string): Promise<number>;
    clear(): Promise<string|null>;
  }
  

class RedisCacheDriver implements CacheDriver {
    private client: RedisClientType
  
    constructor() {
      this.client = createClient({
        url: config.app.redis.url,
      })

      this.client.connect()

      this.client.on('connect', () => "Redis client connected")
    }
  
    async set(key: string, value: any, ttl?: number): Promise<any> {
      const jsonValue = JSON.stringify(value);
  
      if (ttl) {
        return await this.client.setEx(key, ttl, jsonValue)
      } else {
        return await this.client.set(key, jsonValue)
      }
    }
  
    async get(key: string): Promise<any> {
      const data = await this.client.get(key) as string
      return  JSON.parse(data);
    }

    async has(key: string) {
        return await this.client.exists(key);
    }
  
    async delete(key: string) {
      return await this.client.del(key);
    }
  
    async clear() {
      return await this.client.flushDb();
    }
  }

  const redisCache = new RedisCacheDriver()

  export default redisCache
  