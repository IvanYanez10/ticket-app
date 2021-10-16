import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import cookieSession from 'cookie-session';

import { CurrentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/singnin';
import { signoutRouter } from './routes/singnout';
import { signupRouter } from './routes/singnup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: true
  })
);

app.use(CurrentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.all('*', async(req, res)=>{
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };