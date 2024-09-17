import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';

import { KnexModule } from '~/knex/knex.module';

import { WalletsService } from '../wallets.service';
import { Currency } from '../enums/currency.enum';

describe('WalletsService', () => {
  dotenv.config();

  let service: WalletsService;

  const mockWallet = {
    id: 'wallet-id',
    user_id: 'user-id',
    balance: 100,
    currency: Currency.NGN,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletsService],
      imports: [
        KnexModule.forRootAsync({
          useFactory: async () => ({
            client: process.env.DB_CLIENT,
            connection: {
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT),
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
            },
          }),
        }),
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should fail if wallet exists', async () => {
      const result = await service.create(
        { currency: Currency.NGN },
        '6df520b5-7424-11ef-8931-0242ac150003',
      );

      expect(result).toContain('Duplicate entry');
    });

    it('should create a new wallet', async () => {
      const result = await service.create(
        { currency: Currency.NGN },
        '6df520b5-7424-11ef-8931-0242ac150003',
      );

      expect(result).toEqual({ message: 'Wallet created successfully' });
    });
  });

  describe('getWallet', () => {
    it('should return a wallet', async () => {
      const result = await service.getWallet(
        '9bc9cab9-7463-11ef-8931-0242ac150003',
        '6df520b5-7424-11ef-8931-0242ac150003',
      );

      expect(result).toEqual(mockWallet);
    });

    it('should throw AppError when wallet not found', async () => {
      const id = '9bc9cab9-7463-11ef-8931-0242ac150003';
      await expect(
        await service.getWallet(id, '8f0d8d0a-746a-11ef-8931-0242ac150003'),
      ).rejects.toContain('No wallet found  ');
    });
  });

  describe('transfer', () => {
    it('should transfer funds between wallets', async () => {
      const result = await service.transfer(
        {
          senderWalletId: '9bc9cab9-7463-11ef-8931-0242ac150003',
          receiverWalletId: '8f0d8d0a-746a-11ef-8931-0242ac150003',
          amount: 50,
          currency: Currency.NGN,
        },
        '6df520b5-7424-11ef-8931-0242ac150003',
      );

      expect(result).toEqual({
        message: expect.stringContaining('has been transferred successfully'),
      });
    });

    it('should throw AppError on insufficient funds', async () => {
      await expect(
        await service.transfer(
          {
            senderWalletId: '9bc9cab9-7463-11ef-8931-0242ac150003',
            receiverWalletId: '8f0d8d0a-746a-11ef-8931-0242ac150003',
            amount: 50000000,
            currency: Currency.NGN,
          },
          '9bc9cab9-7463-11ef-8931-0242ac150003',
        ),
      ).rejects.toThrow('Insufficient funds to complete this transfer');
    });
  });
});
