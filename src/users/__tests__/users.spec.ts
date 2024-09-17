import { Test, TestingModule } from '@nestjs/testing';

import { KNEX_CONNECTION } from '~/knex/knex.provider';

import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: KNEX_CONNECTION,
          useValue: {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            whereRaw: jest.fn().mockReturnThis(),
            andWhereRaw: jest.fn().mockReturnThis(),
            first: jest.fn(),
            insert: jest.fn(),
            delete: jest.fn(),
            transaction: jest.fn(),
            decrement: jest.fn(),
            increment: jest.fn(),
            join: jest.fn().mockReturnThis(),
            raw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    module.get(KNEX_CONNECTION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
