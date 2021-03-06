import express, { Request, Response } from "express";
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from "@iytickets/common";
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60; // 15* 60 = 15 min

router.post(
'/api/orders', 
requireAuth,
[
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))   //verify if Id have same structure as mongo id
    .withMessage('TicketId must be provided')
],
validateRequest,
async (req: Request, res: Response) => {
  const { ticketId } = req.body;

  // find the ticket the user is trying to order in the database
  const ticket = await Ticket.findById(ticketId);
  if(!ticket){
    throw new NotFoundError();
  }

  // make sure that the ticket isnt reserved
  const isreserved = await ticket.isReserved();
  if(isreserved){
    throw new BadRequestError('Ticket is already reserved');
  }
  
  // calculate expiration date
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  // build the order and save it to the database
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  });
  await order.save();

  // publish an event that an order was created
  await new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    status: order.status,
    userId: order.userId,
    version: order.version,
    expiresAt: order.expiresAt.toISOString(),  // utc time stamp
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  });

  res.status(201).send(order);
});

export { router as newOrderRouter };