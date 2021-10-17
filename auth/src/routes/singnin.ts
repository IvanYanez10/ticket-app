import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@iytickets/common';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must supply a password')
], 
validateRequest,
async (req: Request, res: Response) => {

  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  // if user doest exist
  if(!existingUser){
    throw new BadRequestError('Invalid credentials');
  }

  // compare password
  const passwordsMatch = await Password.compare(
    existingUser.password, 
    password
  );
  if(!passwordsMatch){
    throw new BadRequestError('Invalid credentials');
  }

  // generate JWT  
  const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
    }, process.env.JWT_KEY!
  );

  // store token in session
  req.session = {
    jwt: userJwt
  };

  res.status(201).send(existingUser);

});

export { router as signinRouter };