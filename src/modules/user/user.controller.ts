import { Request, Response } from 'express';
import { UserService } from './user.service';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
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

  async block(req: Request, res: Response) {
    try {
      const id = req.params.id
      const result = await this.userService.block(id)
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await this.userService.findOne(id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const result = await this.userService.findAll(req.query);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
