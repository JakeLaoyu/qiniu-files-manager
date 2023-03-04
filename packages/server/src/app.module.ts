import { join } from 'path';
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './controllers/app.controller';
import { AppService } from './service/app.service';
import { CheckAkSkMiddleware } from './middleware/checkAccessKeySecretKey';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'client/dist'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckAkSkMiddleware).forRoutes(
      {
        path: 'api/upload-token',
        method: RequestMethod.GET,
      },
      {
        path: 'api/private-token',
        method: RequestMethod.GET,
      },
      {
        path: 'api/images',
        method: RequestMethod.GET,
      },
    );
  }
}
