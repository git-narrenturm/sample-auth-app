import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AppDataSource } from '@config/database.config';

config();

class DatabaseService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  async init() {
    try {
      await this.dataSource.initialize();
      console.log('[Database] Connection established');
    } catch (err) {
      console.error('[Database] Initialization failed:', err);
      process.exit(1);
    }
  }

  async shutdown() {
    try {
      await this.dataSource.destroy();
      console.log('[Database] Connection closed');
    } catch (err) {
      console.error('[Database] Error during shutdown:', err);
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.dataSource.query('SELECT 1');
      return result.length > 0;
    } catch (err) {
      console.error('[Database] Health check failed:', err);
      return false;
    }
  }
}

const databaseService = new DatabaseService();
export default databaseService;
