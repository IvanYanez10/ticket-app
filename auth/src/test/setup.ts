import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';
  const mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  const collections = await mongoose.connections.db.collections();
  for(let collection of collections){
    await collection.deletemany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});