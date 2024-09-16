import { Currency } from '../enums/currency.enum';

export class Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: Currency;
  created_at: Date;
  updated_at: Date;
}
