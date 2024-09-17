import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Currency } from '../enums/currency.enum';

export class WithdrawalDTO {
  @IsEnum(Currency)
  @IsNotEmpty()
  currency: Currency;

  @IsNumber()
  @IsNotEmpty()
  @Min(5)
  amount: number;

  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsString()
  bankCode: string;
}
