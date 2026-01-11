import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthMiddleware } from '@middleware/auth.middleware';
import { AuthenticatedRequest } from '@shared/interfaces/authenticated-request.interface';
import { UserRole } from '@entities/user.entity';
import Redis from 'ioredis';

jest.mock('jsonwebtoken');
jest.mock('ioredis');

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;
  let redisClient: Redis;

  beforeEach(() => {
    redisClient = new Redis();
    authMiddleware = new AuthMiddleware();
    req = {
      headers: {},
      user: {
        id: 'ID1',
        role: UserRole.USER,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should return 401 if no authorization header is provided', async () => {
    req.headers = {};
    await authMiddleware.verifyToken(
      req as AuthenticatedRequest,
      res as Response,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
      error: 'No token provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if the token is invalid', async () => {
    req.headers = { authorization: 'Bearer invalidToken' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });
    await authMiddleware.verifyToken(
      req as AuthenticatedRequest,
      res as Response,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if the token is valid', async () => {
    const mockDecoded = { user: { id: 'ID1', role: 'user' } };
    req.headers = { authorization: 'Bearer validToken' };
    (jwt.verify as jest.Mock).mockImplementation(() => mockDecoded);
    jest.spyOn(Redis.prototype, 'get').mockResolvedValue(null);
    await authMiddleware.verifyToken(
      req as AuthenticatedRequest,
      res as Response,
      next,
    );
    expect(req.user).toEqual({ id: 'ID1', role: 'user' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', async () => {
    req.headers = { authorization: 'InvalidTokenFormat' };
    await authMiddleware.verifyToken(
      req as AuthenticatedRequest,
      res as Response,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
      error: 'No token provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if the token is blacklisted', async () => {
    const mockDecoded = { user: { id: 'ID1', role: 'user' } };
    req.headers = { authorization: 'Bearer validToken' };
    (jwt.verify as jest.Mock).mockImplementation(() => mockDecoded);
    jest.spyOn(Redis.prototype, 'get').mockResolvedValue('true');
    await authMiddleware.verifyToken(
      req as AuthenticatedRequest,
      res as Response,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
      error: 'Token is blacklisted',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
