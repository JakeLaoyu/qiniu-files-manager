import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors();

  const port = process.env.PORT || '2017';

  app.use(cookieParser());
  app.use(
    session({
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
      resave: true,
      saveUninitialized: true,
      secret: '0A6194FD0E695254A939A25C3D868D2C',
    }),
  );

  await app.listen(port);

  console.log(`Nest application started on http://localhost:${port}`);
}

bootstrap();
