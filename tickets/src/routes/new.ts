import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@iytickets/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.post('/api/tickets', 
requireAuth,
[
  body('title')
    .notEmpty()
    .withMessage('title is required'),
  body('price')
    .notEmpty()
    .isFloat({ gt: 0 })    
    .withMessage('Price must be grather than cero')
], 
validateRequest,
async (req: Request, res: Response) => {

  const { title, price } = req.body;

  const ticket = Ticket.build({
    title,
    price,
    userId: req.currentUser!.id
  });

  await ticket.save();

  res.status(201).send(ticket);

});

export { router as createTicketRouter };