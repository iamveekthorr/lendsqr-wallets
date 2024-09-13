import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { KNEX_CONNECTION } from '~/constants/constants';

import { User } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex<User, User[]>,
  ) {}

  async getUserById(id: string): Promise<User | null> {
    return this.knex('users').where({ id }).first();
  }
}
