import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';

import { KNEX_CONNECTION } from '~/constants/constants';

import { AppError } from '~/common/app-error.common';
import { ErrorMessage } from '~/common/error-messages.enum';

import { User } from '~/users/schemas/users.schema';

import { JWTPayload } from './jwt-payload.type';
import { AuthDTO } from './dto/auth.dto';
import { RegistrationDTO } from './dto/registration.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(KNEX_CONNECTION) private readonly knex: Knex<User, User[]>,
  ) {}

  private async generateTokens(auth: JWTPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(auth, {
        expiresIn: 60 * 60 * 24,
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      }),
      this.jwtService.signAsync(auth, {
        // Access token will expire in 1week
        expiresIn: 60 * 60 * 24 * 7,
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(id: string) {
    const user = await this.knex('users').where({ id }).first();

    const tokens = await this.generateTokens({
      sub: user.id,
      role: user.role,
    });

    return { tokens };
  }

  async login(authDTO: AuthDTO) {
    const { email, password } = authDTO;

    const data = await this.knex('users').where({ email }).first();

    if (data && (await bcrypt.compare(password, data.password))) {
      // 2) RETURN THE USER IF FOUND AND ADD THE TOKEN TO THE REQUEST BODY
      const tokens = await this.generateTokens({
        sub: data.id,
        role: data.role,
      });

      // Converts the plain object to a class to allow our interceptor remove the password
      const user = plainToInstance(User, data);

      return {
        user,
        tokens,
      };
    }

    throw new AppError(
      ErrorMessage.INVALID_LOGIN_CREDENTIALS,
      HttpStatus.BAD_REQUEST,
    );
  }

  async register(registrationDTO: RegistrationDTO) {
    const SALT = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(registrationDTO.password, SALT);

    await this.knex('users').insert({
      id: this.knex.raw('UUID_TO_BIN(UUID())'),
      email: registrationDTO.email,
      first_name: registrationDTO.first_name,
      last_name: registrationDTO.last_name,
      password: hashedPassword,
    });

    return {
      message: 'Account created successfully',
    };
  }
}
