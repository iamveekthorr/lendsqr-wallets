// knex.module.ts
import { DynamicModule, Module } from '@nestjs/common';
import * as Knex from 'knex';

import { KNEX_CONNECTION } from '~/constants/constants';

@Module({})
export class KnexModule {
  static forRoot(config: Knex.Knex.Config): DynamicModule {
    const knexProvider = {
      provide: KNEX_CONNECTION,
      useFactory: () => Knex(config),
    };

    return {
      module: KnexModule,
      providers: [knexProvider],
      exports: [KNEX_CONNECTION],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    inject?: any[];
    useFactory?: (
      ...args: any[]
    ) => Knex.Knex.Config | Promise<Knex.Knex.Config>;
    global?: boolean;
  }): DynamicModule {
    const knexProvider = {
      provide: KNEX_CONNECTION,
      useFactory: async (...args: any[]) =>
        Knex(await options.useFactory(...args)),
      inject: options.inject || [],
    };

    return {
      global: options.global || false,
      module: KnexModule,
      imports: options.imports || [],
      providers: [knexProvider],
      exports: [KNEX_CONNECTION],
    };
  }
}
