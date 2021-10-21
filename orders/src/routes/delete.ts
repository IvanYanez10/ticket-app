import express, { Request, Response } from "express";
import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth } from "@iytickets/common";
import { Order, OrderStatus } from "../models/order";
import mongoose from 'mongoose';

import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();
// really we are updating order.status
router.delete(
'/api/orders/:orderId', 
requireAuth,
async (req: Request, res: Response) => {

  const { orderId } = req.params;

  if(!mongoose.Types.ObjectId.isValid(orderId)){
    throw new BadRequestError('TicketId must be provided');
  }

  const order = await Order.findById(orderId).populate('ticket');

  if(!order){
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;

  await order.save();

  // publishing an event saying this was cancelled
  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    ticket: {
      id: order.ticket.id,  
    }
  });

  // change state if change request method
  res.status(204).send(order);

});

export { router as deleteOrderRouter };