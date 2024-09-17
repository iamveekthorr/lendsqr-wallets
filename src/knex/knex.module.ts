import { DynamicModule, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as Knex from 'knex';
import {
  KNEX_CONNECTION,
  createKnexProvider,
  createKnexAsyncProvider,
} from './knex.provider';

@Module({})
export class KnexModule {
  constructor(private moduleRef: ModuleRef) {}

  static forRoot(config: Knex.Knex.Config): DynamicModule {
    return {
      module: KnexModule,
      providers: [createKnexProvider(config)],
      exports: [KNEX_CONNECTION],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<Knex.Knex.Config> | Knex.Knex.Config;
    inject?: any[];
    global?: boolean;
  }): DynamicModule {
    return {
      global: options.global || false,
      module: KnexModule,
      imports: options.imports || [],
      providers: [createKnexAsyncProvider(options)],
      exports: [KNEX_CONNECTION],
    };
  }

  async onApplicationShutdown() {
    const knex = this.moduleRef.get<Knex.Knex>(KNEX_CONNECTION);
    await knex.destroy();
  }
}
