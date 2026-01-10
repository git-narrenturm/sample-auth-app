import { AuthService } from '@auth/auth.service';
import { LoginDto } from '@auth/dto/login.dto';
import { TokenOptions } from '@auth/interfaces/token-options.interface';
import { User, UserRole, UserStatus } from '@entities/user.entity';
import { UserDto } from '@user/dto/user.dto';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@config/database.config', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: Partial<Repository<User>>;

  let loginDto: LoginDto;

  let userDto: UserDto;

  beforeEach(() => {
    authService = new AuthService();
    userRepo = {
      createQueryBuilder: jest.fn(),
    };
    (authService as any).userRepo = userRepo;

    loginDto = {
      email: 'ivan.ivanov.test@test.test',
      password: 'password12345',
    };

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

  describe('login', () => {
    it('should return token if successful', async () => {
      const mockedUser = { ...userDto, password: 'password12345', id: 'ID1' };
      (userRepo.createQueryBuilder as jest.Mock).mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockedUser),
      });
      const tokenPayload: TokenOptions = {
        id: mockedUser.id,
        role: mockedUser.role,
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mocked-jwt-token');

      const result = await authService.login(loginDto);

      expect(result).toEqual({ accessToken: 'mocked-jwt-token' });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockedUser.password,
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: tokenPayload },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || '30m' },
      );
    });

    it('should throw error if user is not found', async () => {
      (userRepo.createQueryBuilder as jest.Mock).mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });
      await expect(authService.login(loginDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw error if user is blocked', async () => {
      const blockedUser = { ...userDto, status: UserStatus.INACTIVE };
      (userRepo.createQueryBuilder as jest.Mock).mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(blockedUser),
      });
      await expect(authService.login(loginDto)).rejects.toThrow(
        'User is blocked',
      );
    });

    it('should throw an error if passwords do not match', async () => {
      const mockedUser = { ...userDto, password: 'anotherPassword12345' };
      (userRepo.createQueryBuilder as jest.Mock).mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockedUser),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
