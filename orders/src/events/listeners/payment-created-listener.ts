import { Listener, PaymentCreatedEvent, Subjects, OrderStatus } from "@iytickets/common";
import { Order } from "../../models/order";
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';

export class PaymentCreatedlistener extends Listener<PaymentCreatedEvent>{

  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {

    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('order not found');
    }

    order.set({ status: OrderStatus.Complete });

    await order.save();

    msg.ack();

  }

}