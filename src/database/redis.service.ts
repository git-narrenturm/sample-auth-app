import { config } from 'dotenv';
import Redis from 'ioredis';

config();

class RedisService {
  private client: Redis;

  constructor() {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = Number(process.env.REDIS_PORT) || 6379;

    this.client = new Redis({
      host,
      port,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
    });

    this.client.on('error', (err) => {
      console.error('[Redis] Error:', err.message);
    });

    this.client.on('connect', () => {
      console.log('[Redis] Connected');
    });
  }

  async init() {
    try {
      await this.client.ping();
      console.log('[Redis] Ready');
    } catch (err) {
      console.error('[Redis] Error during init:', err);
    }
  }

  async shutdown() {
    try {
      await this.client.quit();
      console.log('[Redis] Connection closed');
    } catch (err) {
      console.error('[Redis] Error during shutdown:', err);
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

const redisService = new RedisService();
export default redisService;
