import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
import { OrderStatus } from '@iytickets/common';
import { stripe } from '../../stripe';

//jest.mock('../../stripe');

it('return 404 when purchasing and order that does not exist', async () => {
  
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdasasdda',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);

});

it('return 401 when order that doesnt belong to the user', async () => {

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdasasdda',
      orderId: order.id
    })
    .expect(401);

});

it('return a 400 when purchasing a cancelled order', async () => {

  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'asdasasdda',
      orderId: order.id
    })
    .expect(400);

});

it('returns a 201 with valid inputs', async () => {

  const userId = new mongoose.Types.ObjectId().toHexString();

  const price = Math.floor( Math.random() * 100000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  // using real stripe API
  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100
  });

  console.log(stripeCharge);

  expect(stripeCharge).toBeDefined();

  /* // using mock
  const chargeOptions  = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(20 * 100);
  expect(chargeOptions.currency).toEqual('usd');
  */
});


