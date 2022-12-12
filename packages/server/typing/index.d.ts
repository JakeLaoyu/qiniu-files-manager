import 'express';

declare module 'express' {
  interface Request {
    session: {
      accessKey: string;
      secretKey: string;
    };
  }
}
