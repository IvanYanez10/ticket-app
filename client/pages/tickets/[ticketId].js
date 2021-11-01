import { useReducer, useState } from 'react';
import useRquest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {  

  const { doRequest, errors } = useRquest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id
    },
    onSuccess: (order) => console.log(order)
  });

  return (
    <div className="container">
      <h1> {ticket.title} </h1>
      <h4> Price: {ticket.price} </h4>
      {errors}
      <button onClick={doRequest} className="btn btn-primary">Purchase</button>
    </div>
  )
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`)
  return { ticket: data };
};

export default TicketShow;

/* whitecard [] */