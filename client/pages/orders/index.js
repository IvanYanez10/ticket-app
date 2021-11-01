import Link from 'next/link';

const OrderIndex = ({ orders }) => {

  const ordersList = orders.map((order) => {
    return (
      <li key={ticket.id}>
        {order.ticket.title} - {order.status}
      </li>
    )
  });

  return (
    <div>
      <h1>Tickets</h1>
      <ul className="">
        {ordersList}
      </ul>
    </div>
  );
};

// generated in server
OrderIndex.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/orders')
  return { orders: data };
};

export default OrderIndex;