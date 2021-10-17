import { randomBytes } from 'crypto';
import nats, { Message } from 'node-nats-streaming';

console.clear();

const stan = nats.connect(
  'tickets', 
  randomBytes(4).toString('hex'),    // clientID nats has a list of clients
  { url: 'http://localhost:4222' }
);

stan.on('connect', () => {
  console.log('listener connected to NATS');
  const subscription = stan.subscribe('ticket:created', 'orders-service-queue-group');
  subscription.on('message', (msg: Message) => {    
    const data = msg.getData();
    if(typeof data === 'string'){
      console.log(`Recived event #${msg.getSequence()}, with data: ${data}`);
    }
  });
});