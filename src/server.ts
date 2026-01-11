import 'reflect-metadata';
import 'tsconfig-paths/register';

import express from 'express';
import cors from 'cors';

import userRoute from '@routes/user.route';
import authRoute from '@routes/auth.route';
import redisService from '@database/redis.service';
import databaseService from '@database/database.service';

const app = express();

app.use(cors());
app.use(express.json());

(async () => {
  try {
    await databaseService.init();
    await redisService.init();
    app.use('/api/user', userRoute);
    app.use('/api/auth', authRoute);

    const PORT = process.env.NODE_PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Error during server initialization:', error);
  }
})();

export default app;
