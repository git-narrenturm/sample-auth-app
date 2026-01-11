import { Request, Response } from 'express';
import { UserService } from './user.service';
import Redis from 'ioredis';
import { AuthenticatedRequest } from '@root/shared/interfaces/authenticated-request.interface';

export class UserController {
  private userService: UserService;
  private redisService: Redis;
  private jwtExpiresIn = (process.env.JWT_EXPIRES as any) || '30m';

  constructor(userService: UserService) {
    this.userService = userService;
    this.redisService = new Redis();
  }

  /**
   * регистарция нового пользователя
   */
  async create(req: Request, res: Response) {
    try {
      const result = await this.userService.create(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * блокировка пользователя
   */
  async block(req: AuthenticatedRequest, res: Response) {
    try {
      const blockedUserId = req.params.userId;
      const requesterUserId = req.user.id;
      const result = await this.userService.block(blockedUserId);

      // блокировка самого себя
      if (blockedUserId === requesterUserId) {
        const token = req.headers['authorization']?.split(' ')[1];
        await this.redisService.set(
          `blacklisted:${token}`,
          'true',
          'EX',
          parseInt(this.jwtExpiresIn) * 60,
        );
      }

      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * поиск одного пользователя
   */
  async findOne(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.userId;
      const result = await this.userService.findOne(id);

      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  /**
   * выдача списка пользователей
   */
  async findAll(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await this.userService.findAll(req.query);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
