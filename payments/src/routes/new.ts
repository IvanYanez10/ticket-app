import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@iytickets/common';
import { natsWrapper } from '../nats-wrapper';
import { Order } from '../models/order';
import { stripe } from '../stripe';

const router = express.Router();

router.post('/api/payments',
  requireAuth,
  [
    body('token')
      .not()
      .notEmpty(),
    body('orderId')
      .not()
      .notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    // order exist
    if(!order){
      throw new NotFoundError();
    }
    // if another user try to pay for another user order
    if(order.userId !== req.currentUser!.id){
      throw new NotAuthorizedError();
    }
    // check if the order is cancelled
    if(order.status === OrderStatus.Cancelled){
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token
    });

    res.status(201).send({ success: true });

  });

export { router as createChargeRouter };