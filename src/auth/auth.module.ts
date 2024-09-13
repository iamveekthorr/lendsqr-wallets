import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { KnexModule } from '~/knex/knex.module';
import { UsersService } from '~/users/users.service';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtAuthGuard } from './guards/auth.guard';

import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    KnexModule,
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    JwtAuthGuard,
    UsersService,
  ],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
