import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { KNEX_CONNECTION } from '~/constants/constants';

import { User } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex<User, User[]>,
  ) {}

  async getUserById(id: string): Promise<User | null> {
    const user = await this.knex('users')
      .select('*', this.knex.raw('BIN_TO_UUID(id) as id'))
      .where(this.knex.raw('id = UUID_TO_BIN(?)', [id]))
      .first();

    return user;
  }
}
