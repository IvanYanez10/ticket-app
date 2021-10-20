import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

// describes the properties that are required to create
interface TicketAttrs {
  title: string;
  price: number;
}

// properties uer document has
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

// describes the properties that user model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
  title:{
    type: String, 
    required: true
  },
  price: {
    type: Number, 
    required: true,
    min: 0
  }
}, {
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
  }}
});

// for check with TS we call this function
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

// run query look at all orders. find an order where the ticket
// is the ticket we just found *and* the order status is *not* cancelled
// if we find an order from that means the ticket *is* reserved 
ticketSchema.methods.isReserved = async function(){
  // this === the ticket document taht we just called 'isReserved
  const existingOrder = await Order.findOne({
    ticket: this as any,
    status: {
      $in: [        // $in special mongodb operator
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };


/*
  we can share same model from tickets service 
*/