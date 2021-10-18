import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect(
  'tickets', 
  'abc', 
  { url: 'http://localhost:4222' }
);

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);
  try{
    await publisher.publish({
      id: '',
      title: 'concert',
      price: 20
    });
  }catch(e){
    console.error(e);
  }

// just cant share raw data
/*
  const data = JSON.stringify({
    id: '',
    title: 'concert',
    price: 20
  });

  stan.publish('ticket:created', data, () => {
    console.log('event publish');
  });
*/
});