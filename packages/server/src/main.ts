import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Redis from 'redis';
import * as RedisStore from 'connect-redis';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors();

  const { REDIS_HOST = '127.0.0.1', REDIS_PORT = 6379 } = process.env;

  const port = process.env.PORT || '2017';
  const dbUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;

  const redisClient = Redis.createClient({ legacyMode: true, url: dbUrl });
  redisClient.connect().catch(console.error);

  app.use(cookieParser());
  app.use(
    session({
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
      resave: true,
      saveUninitialized: true,
      secret: '0A6194FD0E695254A939A25C3D868D2C',
      // session持久化，存在到mongodb中
      store: new (RedisStore(session))({
        client: redisClient,
        prefix: 'qim:sess:',
      }),
    }),
  );

  await app.listen(port);

  console.log(`Nest application started on http://localhost:${port}`);
}

bootstrap();
