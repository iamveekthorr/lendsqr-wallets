import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '~/users/dto/users.dto';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
