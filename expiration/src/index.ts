import { natsWrapper } from './nats-wrapper';

const start = async () => {
  // NATS env can be here just restart deplyments if there is some error
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  try {
    await natsWrapper.connect(
      'tickets', //process.env.NATS_CLOUSTER_ID, 
      'some-expiration-client', //process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

  } catch (err) {
    console.error(err);
  }
};

start();
