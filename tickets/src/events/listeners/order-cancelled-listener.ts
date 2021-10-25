import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { Listener, OrderCancelledEvent, Subjects } from "@iytickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../models/ticket";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message){
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if the ticket, throw error
    if(!ticket){
      throw new Error('ticket not found');
    }

    // unset the orderId
    ticket.set({ orderId: undefined });

    // save the ticket
    await ticket.save();

    // emit an event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId
    });

    // ack the message
    msg.ack();
    
  }

}