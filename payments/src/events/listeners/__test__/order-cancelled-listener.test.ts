import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@iytickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const setup = async () => {

  // creates an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'someUser',
    version: 0,
    price: 60
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'someId'
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, order, data, msg};
}

// make it for separated
it('updates the status of the order', async () => {

  const { listener, order, data, msg} = await setup();
  
  await listener.onMessage(data, msg);
  
  const updatedOrder = await Order.findById(order.id);
  
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('acks the msg', async () => {

  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();

});
