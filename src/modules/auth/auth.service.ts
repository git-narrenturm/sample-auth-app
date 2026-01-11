import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User, UserStatus } from '@entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AppDataSource } from '@config/database.config';
import { TokenOptions } from './interfaces/token-options.interface';

export class AuthService {
  private userRepo: Repository<User>;

  private jwtSecret = process.env.JWT_SECRET!;
  private jwtExpiresIn = (process.env.JWT_EXPIRES as any) || '30m';

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect(['user.password'])
      .where('user.email = :email', { email: dto.email })
      .getOne();
    if (!user) {
      throw new Error('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw Error('User is blocked');
    }

    // проверяем, совпадают ли пароли
    const hasMatchingPassword = await bcrypt.compare(
      dto.password,
      user.password,
    );
    if (!hasMatchingPassword) {
      throw new Error('Invalid credentials');
    }

    return await this.generateToken({ id: user.id, role: user.role });
  }

  private async generateToken(user: TokenOptions) {
    const payload = { user };
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });

    return { accessToken };
  }
}
