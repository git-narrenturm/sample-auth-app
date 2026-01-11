import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '@shared/interfaces/authenticated-request.interface';
import Redis from 'ioredis';

export class AuthMiddleware {
  private jwtSecret: string;
  private redisClient: Redis;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.redisClient = new Redis();
  }

  public verifyToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authHeader = req.headers['authorization'];

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res
          .status(401)
          .json({ message: 'Unauthorized', error: 'No token provided' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

      const isBlacklisted = await this.redisClient.get(`blacklisted:${token}`);
      if (isBlacklisted) {
        return res
          .status(401)
          .json({ message: 'Unauthorized', error: 'Token is blacklisted' });
      }

      req.user = {
        id: decoded.user.id,
        role: decoded.user.role,
      };

      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
