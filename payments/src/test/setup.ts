import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global{
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51JolOiLdd7o3SujLvTfYF1AAVkOmhXkIUtC6IozCmiUCXKwjGtqLt6vTluA39BmCFdeCEM7uRMqV1VZ4m1a2UbMD00CPlQQZYZ';

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'secretasdfasdf';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for(let collection of collections){
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
}); 

global.signin = (id?: string) => {
  // build jwt payload {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };
  //create jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // build session object
  const session = { jwt: token };
  // turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // take json and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  //return a string thats the cookie with encoded data
  return [`express:sess=${base64}`];
}