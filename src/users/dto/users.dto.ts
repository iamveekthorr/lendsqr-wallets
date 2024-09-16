import { Exclude } from 'class-transformer';

import { Role } from '~/auth/role.enum';

export class User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  role: Role;
  created_at: Date;
  updated_at: Date;
}
