import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { User, UserStatus } from '@entities/user.entity';
import { UserDto } from './dto/user.dto';
import { GetUsersRequestDto, GetUsersResponseDto } from './dto/get-users.dto';
import { CreateUserDto } from './dto/create-user.dto';

export class UserService {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  /**
   * Метод для проверки формата email
   */
  private validateEmail(id: string): Boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(id);
  }

  /**
   * Метод для получения пользователя по email
   */
  private async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  /**
   * Регистрирует нового пользователя
   */
  async create(dto: CreateUserDto): Promise<UserDto> {
    const { email, password, ...userData } = dto;

    if (!this.validateEmail(email)) {
      throw new Error('Incorrect login format');
    }

    // ищем пользователя в БД
    const user = await this.findByEmail(email);
    if (user) {
      throw new Error('User already exists');
    }

    // хешируем пароль и создаем нового пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepo.create({
      email,
      password: hashedPassword,
      ...userData,
    });
    const result = await this.userRepo.save(newUser);
    // возвращаем данные созданного пользователя, исключая пароль
    const { password: _, ...userDTO } = result;
    return userDTO;
  }

  /**
   * Возвращает список пользователей
   */
  async findAll(dto: GetUsersRequestDto): Promise<GetUsersResponseDto> {
    const { orderBy = 'surname', sort = 'asc' } = dto;
    const limit = Number(dto.limit) || 20;
    const page = Number(dto.page) || 1;
    const [items, total] = await this.userRepo.findAndCount({
      order: { [orderBy]: sort },
      take: limit,
      skip: (page - 1) * limit,
    });
    const response = {
      items,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };
    return response;
  }

  /**
   * Возвращает пользователя по ID
   */
  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Блокирует пользователя по ID
   */
  async block(id: string): Promise<UserDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    user.status = UserStatus.INACTIVE;
    await this.userRepo.save(user);

    return user;
  }
}
