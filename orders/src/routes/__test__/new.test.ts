import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

// user login?
// right format for an Id

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')    
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  
  //save a ticket and order to db
  const ticket = Ticket.build({
    title: 'concert',
    price: 10
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId: 'laskdflkajsdf',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();

  // test
  await request(app)
    .post('/api/orders')    
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);

});

it('reserves a ticket', async () => {

  //save a ticket to db
  const ticket = Ticket.build({
    title: 'concert',
    price: 10
  });
  await ticket.save();

  // attemp to reserve
  await request(app)
    .post('/api/orders')    
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it.todo('emits an order created event');