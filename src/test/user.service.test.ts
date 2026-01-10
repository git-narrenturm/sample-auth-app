import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '@entities/user.entity';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserService } from '@user/user.service';
import { Repository } from 'typeorm';
import {
  GetUsersRequestDto,
  GetUsersResponseDto,
} from '@user/dto/get-users.dto';
import { UserDto } from '@user/dto/user.dto';

jest.mock('bcrypt');
jest.mock('@config/database.config', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepo: Partial<Repository<User>>;

  let userDto: UserDto;
  let createUserDto: CreateUserDto;

  beforeEach(() => {
    userService = new UserService();

    userRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    (userService as any).userRepo = userRepo;

    userDto = {
      email: 'ivan.ivanov.test@test.test',
      surname: 'Иванов',
      name: 'Иван',
      fathername: 'Иванович',
      birthDate: new Date('1990-01-01'),
      role: 'user' as UserRole,
      status: 'active' as UserStatus,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate email format', () => {
    const validEmail = 'valid.email@test.test';
    const invalidEmail = 'invalidemailtest.test';
    expect(userService['validateEmail'](validEmail)).toBe(true);
    expect(userService['validateEmail'](invalidEmail)).toBe(false);
  });

  describe('create', () => {
    it('should create a user and return user without password', async () => {
      const hashedPassword = 'hashedPassword12345';
      const newUser = { ...userDto, password: hashedPassword };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepo.create as jest.Mock).mockReturnValue(newUser);
      (userRepo.save as jest.Mock).mockReturnValue(newUser);
      (userRepo.findOne as jest.Mock).mockReturnValue(null);

      const result = await userService.create(newUser);

      expect(result).toEqual(userDto);
      expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
      expect(userRepo.create).toHaveBeenCalledWith(newUser);
      expect(userRepo.save).toHaveBeenCalledWith(newUser);
    });

    it('should throw error if user already exists', async () => {
      createUserDto = { ...userDto, password: 'strongPassword123' };
      (userRepo.findOne as jest.Mock).mockReturnValue(createUserDto);
      await expect(userService.create(createUserDto)).rejects.toThrow(
        'User already exists',
      );
    });

    it('should throw error if email is invalid', async () => {
      const invalidEmail = 'invalidemailtest.test';
      const hashedPassword = 'hashedPassword12345';
      const newUser = {
        ...userDto,
        password: hashedPassword,
        email: invalidEmail,
      };
      await expect(userService.create(newUser)).rejects.toThrow(
        'Incorrect login format',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const dto: GetUsersRequestDto = {
        page: 1,
        limit: 20,
        orderBy: 'surname',
        sort: 'asc',
      };
      const users = [
        {
          id: 'ID1',
          surname: 'Иванов',
          name: 'Иван',
          fathername: 'Иванович',
        },
        {
          id: 'ID2',
          surname: 'Петров',
          name: 'Петр',
          fathername: 'Петрович',
        },
      ];
      const total = users.length;

      (userRepo.findAndCount as jest.Mock).mockResolvedValue([users, total]);
      const result: GetUsersResponseDto = await userService.findAll(dto);

      expect(result.items).toEqual(users);
      expect(result.total).toBe(total);
      expect(result.pages).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });
  describe('findOne', () => {
    it('should return user by ID', async () => {
      const existingUser = { id: 'ID1', ...userDto };
      (userRepo.findOne as jest.Mock).mockResolvedValue(existingUser);
      const result = await userService.findOne(existingUser.id);
      expect(result).toEqual(existingUser);
    });

    it('should throw error if user not found', async () => {
      const userId = 'ID1';
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(userService.findOne(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('block', () => {
    it('should block user by ID', async () => {
      const existingUser = { id: 'ID1', ...userDto };
      (userRepo.findOne as jest.Mock).mockResolvedValue(existingUser);
      (userRepo.save as jest.Mock).mockResolvedValue({
        ...existingUser,
        status: UserStatus.INACTIVE,
      });
      const result = await userService.block(existingUser.id);
      expect(result.status).toBe(UserStatus.INACTIVE);
      expect(userRepo.save).toHaveBeenCalledWith({
        ...existingUser,
        status: UserStatus.INACTIVE,
      });
    });

    it('should throw error if user not found', async () => {
      const existingUser = { id: 'ID1', ...userDto };
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(userService.block(existingUser.id)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
