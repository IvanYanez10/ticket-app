import express, { Request, Response } from "express";
import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth } from "@iytickets/common";
import { Order, OrderStatus } from "../models/order";
import mongoose from 'mongoose';

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

  const order = await Order.findById(orderId);

  if(!order){
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;

  await order.save();

  // publishing an event saying this was cancelled

  // change state if change request method
  res.status(204).send(order);

});

export { router as deleteOrderRouter };