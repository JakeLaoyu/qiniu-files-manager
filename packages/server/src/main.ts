import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  }

  const port = process.env.PORT || '2017';

  app.use(cookieParser());
  app.use(
    session({
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
      resave: true,
      saveUninitialized: true,
      secret: uuidv4(),
    }),
  );

  await app.listen(port);

  console.log(`Nest application started on http://localhost:${port}`);
}

bootstrap();
