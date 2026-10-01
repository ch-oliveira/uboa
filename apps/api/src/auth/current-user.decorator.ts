import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUserResponse } from './auth.service.js';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUserResponse | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
