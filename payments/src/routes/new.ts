import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@iytickets/common';
import { natsWrapper } from '../nats-wrapper';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payments';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';

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

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    });

    await payment.save();

    // publish payment created await
    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });
    // can write a test for this response
    res.status(201).send({ id: payment.id });

  });

export { router as createChargeRouter };