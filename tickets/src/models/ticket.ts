import mongoose from 'mongoose';

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
}, {
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      //delete ret.__v;
  }}
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };