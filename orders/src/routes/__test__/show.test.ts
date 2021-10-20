import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {

  // creates the ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10
  });
  await ticket.save();
  const user = global.signin();

  // make request to build an rder with this ticket
  const { body: order } = 
    await request(app)
    .post('/api/orders')    
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  const { body: fetchOrder} = 
    await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

    expect(fetchOrder.id).toEqual(order.id);

});

it('return an error if user try to access to another user order', async () => {

  // creates the ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 10
  });
  await ticket.save();
  const user = global.signin();  

  // make request to build an rder with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')    
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);

});

// order not found

// order not belong to that user