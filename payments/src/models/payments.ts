import mongoose from 'mongoose';

// describes the properties that are required to create
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

// properties user document has, al ready contains id
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  // version may needed in the future
}

// describes the properties that user model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  stripeId: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };