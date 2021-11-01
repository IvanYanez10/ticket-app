import { Publisher, Subjects, PaymentCreatedEvent } from '@iytickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
