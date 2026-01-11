import { UserRole, UserStatus } from '@entities/user.entity';
import { AuthenticatedRequest } from '@root/shared/interfaces/authenticated-request.interface';
import { GetUsersRequestDto } from '@user/dto/get-users.dto';
import { UserDto } from '@user/dto/user.dto';
import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';
import { Request, Response } from 'express';
import Redis from 'ioredis';

jest.mock('@user/user.service');
jest.mock('ioredis');

describe('UserController', () => {
  let userService: jest.Mocked<UserService>;
  let userController: UserController;
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let redisClient: Redis;
  let userDto: UserDto;

  beforeEach(() => {
    redisClient = new Redis();
    userService = new UserService() as jest.Mocked<UserService>;
    userController = new UserController(userService);

    userDto = {
      email: 'ivan.ivanov.test@test.test',
      surname: 'Иванов',
      name: 'Иван',
      fathername: 'Иванович',
      birthDate: new Date('1990-01-01'),
      role: 'user' as UserRole,
      status: 'active' as UserStatus,
    };

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('create', () => {
    it('should create a new user and return 201', async () => {
      const mockedUser = { id: 'ID1', ...userDto };
      userService.create.mockResolvedValue(mockedUser);
      req.body = userDto;
      await userController.create(req as Request, res as Response);
      expect(userService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockedUser);
    });

    it('should return error if create user fails', async () => {
      const error = new Error('User creation failed');
      userService.create.mockRejectedValue(error);
      req.body = userDto;
      await userController.create(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('block', () => {
    it('should block a user and return 200', async () => {
      const requesterId = 'ID1';
      const blockedUserId = 'ID2';
      const blockedUser = {
        id: blockedUserId,
        ...userDto,
        status: UserStatus.INACTIVE,
      };
      req = {
        params: {
          userId: blockedUserId,
        },
        user: {
          id: requesterId,
          role: UserRole.ADMIN,
        },
      };
      jest.spyOn(Redis.prototype, 'set').mockResolvedValue('');
      userService.block.mockResolvedValue(blockedUser);
      await userController.block(req as AuthenticatedRequest, res as Response);
      expect(userService.block).toHaveBeenCalledWith(blockedUserId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(blockedUser);
    });

    it('should return error if block user fails', async () => {
      const requesterId = 'ID1';
      const blockedUserId = 'ID2';
      const blockedUser = {
        id: blockedUserId,
        ...userDto,
        status: UserStatus.INACTIVE,
      };
      req = {
        params: {
          userId: blockedUserId,
        },
        user: {
          id: requesterId,
          role: UserRole.ADMIN,
        },
      };
      const error = new Error('User block failed');
      jest.spyOn(Redis.prototype, 'set').mockResolvedValue('');
      userService.block.mockRejectedValue(error);
      await userController.block(req as AuthenticatedRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('find', () => {
    it('should find a user by id and return 200', async () => {
      const id = 'ID1';
      const user = { id, ...userDto };
      userService.findOne.mockResolvedValue(user);
      req.params = { userId: id };
      await userController.findOne(
        req as AuthenticatedRequest,
        res as Response,
      );
      expect(userService.findOne).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should return error if find one user fails', async () => {
      const error = new Error('User not found');
      userService.findOne.mockRejectedValue(error);
      req.params = { userId: 'ID1' };
      await userController.findOne(
        req as AuthenticatedRequest,
        res as Response,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('findAll', () => {
    it('should return a list of users and return 200', async () => {
      const mockedUserList = [
        { id: 'ID1', ...userDto },
        { id: 'ID2', ...userDto },
      ];
      const total = mockedUserList.length;

      const page = 1;
      const limit = 20;
      const pages = Math.ceil(total / limit);

      const result = {
        items: mockedUserList,
        total,
        pages,
        page,
        limit,
      };
      userService.findAll.mockResolvedValue(result);
      req.query = {};
      await userController.findAll(
        req as AuthenticatedRequest,
        res as Response,
      );
      expect(userService.findAll).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should return error if find all users fails', async () => {
      const error = new Error('Failed to retrieve users');
      userService.findAll.mockRejectedValue(error);
      req.query = {};
      await userController.findAll(
        req as AuthenticatedRequest,
        res as Response,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
