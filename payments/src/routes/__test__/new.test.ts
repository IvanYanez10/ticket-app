import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
import { OrderStatus } from '@iytickets/common';

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