import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// describes the properties that are required to create a new user
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// properties uer document has
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;   // ? make it optional
}

// describes the properties that user model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}
// Type comes from mongo
const ticketSchema = new mongoose.Schema({
  title:{
    type: String, 
    required: true
  },
  price: {
    type: Number, 
    required: true
  },
  userId:{
    type: String, 
    required: true
  },
  orderId: {
    type: String
  },
}, {
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
  }}
});

// track the version
ticketSchema.set('versionKey', 'version');

ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };