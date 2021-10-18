import { Publisher, Subjects, TicketUpdatedEvent } from '@iytickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
}