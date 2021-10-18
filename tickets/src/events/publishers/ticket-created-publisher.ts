import { Publisher, Subjects, TicketCreatedEvent } from '@iytickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
