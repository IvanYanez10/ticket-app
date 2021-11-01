import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';

const OrderShow = ({ order, currentUser }) => {  
  
  const [timeLeft, setTimeLeft] = useState(0);

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
        token={(token) => console.log(token)}
        stripeKey="pk_test_51JolOiLdd7o3SujLtbx4V2d8g7uzTGkhrIbnrXdwkKCmAE4jeYPuxvNu6oGaNNcWiJ6ennp6lJYmwHIYytatEGTk00fs7II64e" // hide secrete, env_var
        amount={order.ticket.price * 100} //its in cents for stripe
        email={currentUser.email}
      />
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