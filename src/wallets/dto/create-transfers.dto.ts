import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

import { Currency } from '../enums/currency.enum';

export class CreateTransferDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(5) // make sure user cannot transfer less than 10 in any currency
  amount: number;

  @IsString()
  @IsNotEmpty()
  senderWalletId: string;

  @IsString()
  @IsNotEmpty()
  receiverWalletId: string;

  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;
}
