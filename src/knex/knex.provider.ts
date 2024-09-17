import { Provider } from '@nestjs/common';
import * as Knex from 'knex';

export const KNEX_CONNECTION = 'KNEX_CONNECTION';

export const createKnexProvider = (config: Knex.Knex.Config): Provider => ({
  provide: KNEX_CONNECTION,
  useFactory: () => Knex(config),
});

export const createKnexAsyncProvider = (options: {
  useFactory: (...args: any[]) => Promise<Knex.Knex.Config> | Knex.Knex.Config;
  inject?: any[];
}): Provider => ({
  provide: KNEX_CONNECTION,
  useFactory: async (...args: any[]) => {
    const config = await options.useFactory(...args);
    const knex = Knex(config);
    await knex.raw('SELECT 1');
    return knex;
  },
  inject: options.inject || [],
});
