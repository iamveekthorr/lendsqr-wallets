import { Test, TestingModule } from '@nestjs/testing';

import { WalletsService } from '../wallets.service';
import { Currency } from '../enums/currency.enum';

import { KNEX_CONNECTION } from '~/knex/knex.provider';
import { AppError } from '~/common/app-error.common';

describe('WalletsService', () => {
  let service: WalletsService;
  let knexMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
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

    service = module.get<WalletsService>(WalletsService);
    knexMock = module.get(KNEX_CONNECTION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new wallet', async () => {
      knexMock.insert.mockResolvedValue({});

      const result = await service.create(
        { currency: Currency.NGN },
        'user-id',
      );

      expect(result).toEqual({ message: 'Wallet created successfully' });
    });
  });

  describe('getWallet', () => {
    it('should return a wallet', async () => {
      const mockWallet = {
        id: 'wallet-id',
        user_id: 'user-id',
        balance: 100,
        currency: Currency.NGN,
      };
      knexMock.first.mockResolvedValue(mockWallet);

      const result = await service.getWallet('wallet-id', 'user-id');

      expect(result).toEqual(mockWallet);
    });

    it('should throw AppError when wallet not found', async () => {
      knexMock.first.mockResolvedValue(null);

      await expect(
        service.getWallet('non-existent-id', 'user-id'),
      ).rejects.toThrow(AppError);
    });
  });

  describe('transfer', () => {
    it('should transfer funds between wallets', async () => {
      const mockSenderWallet = {
        id: 'sender-id',
        user_id: 'user-id',
        balance: 100,
        currency: Currency.NGN,
      };
      const mockReceiverWallet = {
        id: 'receiver-id',
        user_id: 'receiver-user-id',
        balance: 50,
        currency: Currency.NGN,
        first_name: 'John',
        last_name: 'Doe',
      };

      knexMock.first
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(mockReceiverWallet);
      knexMock.transaction.mockImplementation((cb) => cb(knexMock));

      const result = await service.transfer(
        {
          senderWalletId: 'sender-id',
          receiverWalletId: 'receiver-id',
          amount: 50,
          currency: Currency.NGN,
        },
        'user-id',
      );

      expect(result).toEqual({
        message: expect.stringContaining('has been transferred successfully'),
      });
    });

    it('should throw AppError on insufficient funds', async () => {
      const mockSenderWallet = {
        id: 'sender-id',
        user_id: 'user-id',
        balance: 10,
        currency: Currency.NGN,
      };
      knexMock.first.mockResolvedValue(mockSenderWallet);

      await expect(
        service.transfer(
          {
            senderWalletId: 'sender-id',
            receiverWalletId: 'receiver-id',
            amount: 50,
            currency: Currency.NGN,
          },
          'user-id',
        ),
      ).rejects.toThrow(AppError);
    });
  });

  // Add more test cases for other methods...
});
