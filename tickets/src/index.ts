import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async () => {

  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY must be define');
  }
  
  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI must be define');
  }

  try{

    await natsWrapper.connect('tickets', 'asdasd', 'http://nats-srv:4222');
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close()); // interrrupt signals
    process.on('SIGTERM', () => natsWrapper.client.close()); // terminate signals 

    await mongoose.connect(process.env.MONGO_URI);

  }catch(err){
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000 tickets");
  });
};

start();