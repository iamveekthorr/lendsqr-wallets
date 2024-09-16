import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';
import { AxiosError } from 'axios';

import { KNEX_CONNECTION } from '~/constants/constants';

import { AppError } from '~/common/app-error.common';
import { ErrorMessage } from '~/common/error-messages.enum';

import { User } from '~/users/dto/users.dto';

import { JWTPayload } from './jwt-payload.type';
import { AuthDTO } from './dto/auth.dto';
import { RegistrationDTO } from './dto/registration.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, of, throwError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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

  private async refreshToken(id: string) {
    const user = await this.knex('users').where({ id }).first();

    const tokens = await this.generateTokens({
      sub: user.id,
      role: user.role,
    });

    return { tokens };
  }

  private async checkKarmaBlacklist(email: string) {
    // check if the users us blacklisted using the Lendsqr API
    const uri = `${this.configService.get<string>('LENDSQR_API_URL')}/verification/karma/${email}`;

    const data = await firstValueFrom(
      this.httpService
        .get(uri, {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('LENDSQR_API_KEY')}`,
          },
        })
        .pipe(
          catchError((err: AxiosError) => {
            if (err.status !== HttpStatus.NOT_FOUND) {
              // throw the error so the global handler can catch it
              return throwError(
                () =>
                  new AppError(
                    (err.response.data as { [x: string]: string }).message ||
                      ErrorMessage.CUSTOM_SERVER_ERROR,
                    err.status || HttpStatus.UNPROCESSABLE_ENTITY,
                  ),
              );
            }
            return of(null); // return observable
          }),
        ),
    );

    return data;
  }

  async login(authDTO: AuthDTO) {
    const { email, password } = authDTO;

    const data = await this.knex('users')
      .select('*', this.knex.raw('BIN_TO_UUID(id) as id')) // convert the uuid binary to human readable string
      .where({ email })
      .first();

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

  async create(registrationDTO: RegistrationDTO) {
    const data = await this.checkKarmaBlacklist(registrationDTO.email);

    // Once data is null, create user
    if (!data) {
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

    // this will happen only in a case where the data returns something that is not null
    throw new AppError(
      ErrorMessage.CUSTOM_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
