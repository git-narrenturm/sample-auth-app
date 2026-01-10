import "reflect-metadata";
import "tsconfig-paths/register";

import express from "express";
import cors from "cors";

import { initializeDatabase } from "@config/database.config";

import userRoute from "@routes/user.route";
import authRoute from "@routes/auth.route";

const app = express();

app.use(cors());
app.use(express.json());

await initializeDatabase();

app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);

const PORT = process.env.NODE_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
