import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError } from '@iytickets/common';
import cookieSession from 'cookie-session';

import { CurrentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/singnin';
import { signoutRouter } from './routes/singnout';
import { signupRouter } from './routes/singnup';


const app = express();
app.set('trust proxy', true);
app.use(json());
// secure value to flse in test
app.use(
  cookieSession({
    signed: false,
    secure: false//process.env.NODE_ENV !== 'test'
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