import nats from 'node-nats-streaming';

const stan = nats.connect(
  'tickets', 
  'abc', 
  { url: 'http://localhost:4222' }
);

stan.on('connect', () => {
  console.log('publiher connected to NATS');

// just cant share raw data
  const data = JSON.stringify({
    id: '',
    title: 'concert',
    price: 20
  });

  stan.publish('ticket:created', data, () => {
    console.log('event publish');
  });

});