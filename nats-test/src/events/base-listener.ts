import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event{
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event>{
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;
  private client: Stan;
  protected ackwait = 5 * 1000;

  constructor(client: Stan){
    this.client = client;
  }

  subscriptionOptions(){
    return this.client
    .subscriptionOptions() //options are chainable
    .setDeliverAllAvailable() // first time we launch our service it listen all the record in the past
    .setManualAckMode(true) // after our proces went good we send Ok
    .setAckWait(this.ackwait)
    .setDurableName(this.queueGroupName);
  }

  listen(){
    const subscription = this.client.subscribe(
      this.subject, // chanel_subscribed
      this.queueGroupName, // queue_group_member
      this.subscriptionOptions()
    );
    subscription.on('message', (msg: Message) => {
      console.log(
        `Message recived #${this.subject} / ${this.queueGroupName}`
      );
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message){
    const data = msg.getData();
    return typeof data === 'string'
    ? JSON.parse(data)
    : JSON.parse(data.toString('utf8'));
  }

}