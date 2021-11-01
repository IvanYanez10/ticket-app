import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {  
  
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: () => Router.push('/orders')
  });

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
      <StripeCheckout 
        token={(id) => doRequest({ token: id})}
        stripeKey="pk_test_51JolOiLdd7o3SujLtbx4V2d8g7uzTGkhrIbnrXdwkKCmAE4jeYPuxvNu6oGaNNcWiJ6ennp6lJYmwHIYytatEGTk00fs7II64e" // hide secrete, env_var
        amount={order.ticket.price * 100} //its in cents for stripe
        email={currentUser.email}
      />
      {errors}
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