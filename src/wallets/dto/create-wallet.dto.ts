import { IsEnum, IsOptional } from 'class-validator';
import { Currency } from '../enums/currency.enum';

export class CreateWalletDTO {
  @IsEnum(Currency)
  @IsOptional()
  currency: Currency;
}
