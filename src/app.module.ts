import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

import { validate } from './env.validate';

import { ValidationPipe } from './pipes/validation.pipe';
import { GlobalExceptionsFilter } from './global-filters/global-exception.filter';

import { ResponseInterceptor } from './interceptors/response.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';

import { KnexModule } from './knex/knex.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    KnexModule.forRootAsync({
      global: true, // I don't have to register this module within other modules
      useFactory: async (config: ConfigService) => ({
        client: config.get<string>('DB_CLIENT'),
        connection: {
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          user: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    { provide: APP_FILTER, useClass: GlobalExceptionsFilter },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    JwtService,
  ],
})
export class AppModule {}
