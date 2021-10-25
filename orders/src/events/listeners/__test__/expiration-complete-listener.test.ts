import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { OrderStatus, ExpirationCompleteEvent } from '@iytickets/common';
import { ExpirationCompleteListener } from '../expiration-complete-listener';

const setup = async () => {

  // creates an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'some title',
    price: 20
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'some user',
    expiresAt: new Date(),
    ticket
  });

  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

  // create a fake message ocject
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, order, data, msg };
}

it('updates the order status to cancelled', async () => {

  const { listener, order, data, msg } = await setup();
  
  await listener.onMessage(data, msg);
  
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  
});

it('emit an orderCancelled event', async () => {

  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);  

  expect(eventData.id).toEqual(order.id);

});

it('ack the message', async () => {

  const { listener, data, msg } = await setup();
  
  await listener.onMessage(data, msg);
  
  expect(msg.ack).toHaveBeenCalled();

});