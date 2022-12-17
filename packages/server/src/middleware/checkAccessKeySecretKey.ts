import { HttpCode, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CheckAkSkMiddleware implements NestMiddleware {
  @HttpCode(401)
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.session.accessKey || !req.session.secretKey) {
      res.json({
        code: 3,
        message: 'accessKey secretKey 不存在',
      });
      return;
    }

    next();
  }
}
