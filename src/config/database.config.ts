import { config } from "dotenv";
import { DataSource } from "typeorm";
import { User } from "@entities/user.entity";

config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: +(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User],
  synchronize: true,
  logging: false,
});
