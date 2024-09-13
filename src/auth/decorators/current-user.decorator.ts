import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { User } from '~/users/schema/users.schema';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
