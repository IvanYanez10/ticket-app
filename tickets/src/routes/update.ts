import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@iytickets/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.put(
'/api/tickets/:id', 
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

  const ticket = await Ticket.findById(req.params.id);
  
  if(!ticket){
    throw new NotFoundError();
  }

  if(ticket.userId !== req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  
  ticket.set({
    title: req.body.title,
    price: req.body.price
  });

  // mongoose
  await ticket.save();

  res.send(ticket);

});

export { router as updateTicketRouter };