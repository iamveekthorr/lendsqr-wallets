import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

import { KNEX_CONNECTION } from '~/knex/knex.provider';
import { AppError } from '~/common/app-error.common';

import { Wallet } from './dto/wallet.dto';
import { CreateWalletDTO } from './dto/create-wallet.dto';
import { CreateTransferDTO } from './dto/create-transfers.dto';
import { ReceiverWalletDTO } from './dto/receiver-wallet.dto';
import { FundWalletDTO } from './dto/fund-wallet.dto';
import { WithdrawalDTO } from './dto/withdrawal.dto';

@Injectable()
export class WalletsService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex<Wallet, Wallet[]>,
  ) {}
  async create(createWalletDto: CreateWalletDTO, userId: string) {
    // 1. Get the currency
    const { currency } = createWalletDto;

    // 2. Insert into the db
    await this.knex('wallets').insert({
      id: this.knex.raw('UUID_TO_BIN(UUID())'),
      user_id: this.knex.raw('UUID_TO_BIN(?)', [userId]),
      currency, // currency is optional for every wallet
    });

    return { message: 'Wallet created successfully' };
  }

  async delete(id: string, user_id: string) {
    const affected = await this.knex('wallets')
      .whereRaw('id = UUID_TO_BIN(?)', [id])
      .andWhereRaw('user_id = UUID_TO_BIN(?)', [user_id])
      .delete();

    if (affected > 0) return { message: 'Wallet deleted successfully' };

    return { message: 'Unable to delete wallet' };
  }

  async getWallet(id: string, user_id: string) {
    // make sure that only a wallet belonging to the currently logged in user will be sent back
    const wallet: Wallet = await this.knex<Wallet>('wallets')
      .select(
        '*',
        this.knex.raw('BIN_TO_UUID(id) as id'),
        this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
      )
      .whereRaw('id = UUID_TO_BIN(?)', [id])
      .andWhereRaw('user_id = UUID_TO_BIN(?)', [user_id])
      .first();

    if (!wallet) {
      throw new AppError(
        `No wallet found with the id of ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return wallet;
  }

  async getWallets(id: string) {
    const wallet: Wallet[] = await this.knex<Wallet[]>('wallets')
      .select(
        '*',
        this.knex.raw('BIN_TO_UUID(id) as id'),
        this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
      )
      .where(this.knex.raw('user_id = UUID_TO_BIN(?)', [id]));

    return wallet;
  }

  async transfer(createWalletsDto: CreateTransferDTO, user_id: string) {
    const { senderWalletId, amount, currency, receiverWalletId } =
      createWalletsDto;
    // begin transactions - SQL
    return await this.knex.transaction(
      async (transaction: Knex.Transaction<Wallet, Wallet[]>) => {
        // find the wallet
        const senderWallet: Wallet = await this.knex<Wallet>('wallets')
          .select(
            '*',
            this.knex.raw('BIN_TO_UUID(id) as id'),
            this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
          )
          .whereRaw('id = UUID_TO_BIN(?)', [senderWalletId])
          .andWhereRaw('user_id = UUID_TO_BIN(?)', [user_id])
          .first();

        // Check if sender has a wallet
        if (!senderWallet) {
          throw new AppError(
            `No wallet found with the id of ${senderWalletId}. Please check wallet id again or create one if you do not have one`,
            HttpStatus.NOT_FOUND,
          );
        }

        // Check if sender has up to that amount in their wallet
        if (senderWallet.balance < amount) {
          throw new AppError(
            'Insufficient funds to complete this transfer',
            HttpStatus.BAD_REQUEST,
          );
        }

        // make sure the funds being transferred are in the same currency
        if (senderWallet.currency !== currency) {
          throw new AppError(
            `Transfer currency does not match the sender's wallet currency`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Debit sender
        await transaction('wallets')
          .select(
            '*',
            this.knex.raw('BIN_TO_UUID(id) as id'),
            this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
          )
          .whereRaw('id = UUID_TO_BIN(?)', [senderWalletId])
          .andWhereRaw('user_id = UUID_TO_BIN(?)', [user_id])
          .decrement('balance', amount);

        //  find the wallet to be updated
        const receiverWallet: ReceiverWalletDTO =
          await this.knex<ReceiverWalletDTO>('wallets')
            .join('users', 'wallets.user_id', '=', 'users.id')
            .select(
              'wallets.id',
              'wallets.balance',
              this.knex.raw('BIN_TO_UUID(wallets.id) as id'),
              this.knex.raw('BIN_TO_UUID(wallets.user_id) as user_id'),
              'users.first_name',
              'users.last_name',
            )
            .whereRaw('wallets.id = UUID_TO_BIN(?)', [receiverWalletId])
            .first();

        // credit the receiver wallet
        await transaction('wallets')
          .increment('balance', amount)
          .select(
            '*',
            this.knex.raw('BIN_TO_UUID(id) as id'),
            this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
          )
          .whereRaw('id = UUID_TO_BIN(?)', [receiverWalletId]);

        return {
          message: `${amount} (${currency}) has been transferred successfully to ${receiverWallet.first_name} ${receiverWallet.last_name}`,
        };
      },
    );
  }

  async fund(createWalletsDto: FundWalletDTO, user_id: string) {
    const { walletId, amount, currency } = createWalletsDto;
    // begin transactions - SQL
    return await this.knex.transaction(
      async (transaction: Knex.Transaction<Wallet, Wallet[]>) => {
        // find the wallet
        const wallet: Wallet = await this.knex<Wallet>('wallets')
          .select(
            '*',
            this.knex.raw('BIN_TO_UUID(id) as id'),
            this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
          )
          .whereRaw('id = UUID_TO_BIN(?)', [walletId])
          .andWhereRaw('user_id = UUID_TO_BIN(?)', [user_id])
          .first();

        // Check if user has a wallet
        if (!wallet) {
          throw new AppError(
            `No wallet found with the id of ${walletId}. Please check wallet id again or create one if you do not have one`,
            HttpStatus.NOT_FOUND,
          );
        }

        // make sure the funds being transferred are in the same currency
        if (wallet.currency !== currency) {
          throw new AppError(
            `Transfer currency does not match the sender's wallet currency`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Credit wallet
        await transaction('wallets')
          .select(
            '*',
            this.knex.raw('BIN_TO_UUID(id) as id'),
            this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
          )
          .whereRaw('id = UUID_TO_BIN(?)', [wallet.id])
          .andWhereRaw('user_id = UUID_TO_BIN(?)', [user_id])
          .increment('balance', amount);

        return {
          message: `${amount} (${currency}) has been deposited successfully to ${wallet.id}.`,
        };
      },
    );
  }

  async withdraw(createWalletsDto: WithdrawalDTO, user_id: string) {
    const { walletId, amount, currency } = createWalletsDto;
    // begin transactions - SQL
    return await this.knex.transaction(
      async (transaction: Knex.Transaction<Wallet, Wallet[]>) => {
        // find the wallet
        const wallet: Wallet = await this.knex<Wallet>('wallets')
          .select(
            '*',
            this.knex.raw('BIN_TO_UUID(id) as id'),
            this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
          )
          .whereRaw('id = UUID_TO_BIN(?)', [walletId])
          .andWhereRaw('user_id = UUID_TO_BIN(?)', [user_id])
          .first();

        // Check if user has a wallet
        if (!wallet) {
          throw new AppError(
            `No wallet found with the id of ${walletId}. Please check wallet id again or create one if you do not have one`,
            HttpStatus.NOT_FOUND,
          );
        }

        // make sure the funds being transferred are in the same currency
        if (wallet.currency !== currency) {
          throw new AppError(
            `Transfer currency does not match the sender's wallet currency`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // make sure the user has enough funds
        if (wallet.balance < amount) {
          throw new AppError(
            'Insufficient funds to complete this transfer',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Debit wallet
        await transaction('wallets')
          .select(
            '*',
            this.knex.raw('BIN_TO_UUID(id) as id'),
            this.knex.raw('BIN_TO_UUID(user_id) as user_id'),
          )
          .whereRaw('id = UUID_TO_BIN(?)', [wallet.id])
          .andWhereRaw('user_id = UUID_TO_BIN(?)', [user_id])
          .decrement('balance', amount);

        return {
          message: `${amount} (${currency}) has been withdrawn successfully from ${wallet.id}.`,
        };
      },
    );
  }
}
