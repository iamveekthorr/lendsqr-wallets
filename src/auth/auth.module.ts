import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

import { KnexModule } from '~/knex/knex.module';
import { UsersService } from '~/users/users.service';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { AppAuthGuard } from './guards/auth.guard';

import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    KnexModule,
    HttpModule,
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AppAuthGuard,
    UsersService,
  ],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
