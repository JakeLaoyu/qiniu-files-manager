import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';

import { AppController } from './controllers/app.controller';
import { AppService } from './service/app.service';
import { CheckAkSkMiddleware } from './middleware/checkAccessKeySecretKey';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckAkSkMiddleware).forRoutes(
      {
        path: 'api/uploadToken',
        method: RequestMethod.GET,
      },
      {
        path: 'api/getPrivateToken',
        method: RequestMethod.GET,
      },
      {
        path: 'api/getImages',
        method: RequestMethod.GET,
      },
    );
  }
}
