import { Injectable, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { JWTPayload } from '../jwt-payload.type';

import { UsersService } from '~/users/users.service';

import { AppError } from '~/common/app-error.common';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  public async validate(payload: JWTPayload) {
    const { sub } = payload;

    // find user using the provided token
    const user = await this.userService.getUserById(sub);

    if (!user)
      throw new AppError(
        `no user Found with the id ${sub}`,
        HttpStatus.NOT_FOUND,
      );

    return user;
  }
}
