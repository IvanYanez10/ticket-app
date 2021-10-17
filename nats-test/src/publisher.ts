import nats from 'node-nats-streaming';

const stan = nats.connect(
  'tickets', 
  'abc', 
  { url: 'http://localhost:4222' }
);

stan.on('connect', () => {
  console.log('publiher connected to NATS');
});