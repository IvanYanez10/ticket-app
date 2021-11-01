import { useEffect, useState } from 'react';
import useRquest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order }) => {  
  
  const [timeLeft, setTimeLeft] = setState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []); // [] -> calls onece

  if(timeLeft < 0){
    return (
      <div className="container">
        <h1> Order expired </h1>
      </div>
    )
  }

  return (
    <div className="container">
      <h1> Time left to pay: {timeLeft} seconds </h1>
    </div>
  )
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`)
  return { order: data };
};

export default OrderShow;

/* whitecard [] */