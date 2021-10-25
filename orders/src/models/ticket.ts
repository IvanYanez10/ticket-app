import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

// describes the properties that are required to create
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// properties uer document has
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

// describes the properties that user model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: { id: string, version:number }): Promise<TicketDoc | null>;
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

ticketSchema.set('versionKey', 'version');

ticketSchema.plugin(updateIfCurrentPlugin); // 396 optional

// if we are not using updateIfCurrentPlugin
/*
ticketSchema.pre('save', function(done) {
  // @ts-ignore
  this.$where = {
    version: this.get('version') -1
  }

  done();

});
*/
ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version -1
  })
};

// for check with TS we call this function
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
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