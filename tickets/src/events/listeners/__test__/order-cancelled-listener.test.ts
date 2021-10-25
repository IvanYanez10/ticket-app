import mongoose from 'mongoose';
import { OrderCancelledEvent } from '@iytickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {

  // creates an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'someUser'
  });

  ticket.set({ orderId });

  await ticket.save();

  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
        id: ticket.id
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg, orderId };
}

// make it for separated
it('updates the ticket, publishes an event and acks the message', async () => {

  const { listener, ticket, data, msg, orderId } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);
  
  // updates the ticket
  expect(updatedTicket!.orderId).not.toBeDefined();  

  // acks the message
  expect(msg.ack).toHaveBeenCalled();

  // publishes an event
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  
});