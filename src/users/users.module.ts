import { Module } from '@nestjs/common';

import { KnexModule } from '~/knex/knex.module';

@Module({ imports: [KnexModule] })
export class UsersModule {}
