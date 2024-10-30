import { ExecutionContext, createParamDecorator } from '@nestjs/common';
export const UserReq = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
