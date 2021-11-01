import { useState } from 'react';
import useRquest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = () => {

  const [title, setTitle] = useState('');
  cosnt [price, setPrice] = usePrice('');

  const { doRequest, errors } = useRquest({
    url: '/api/tickets',
    method: 'post',
    body:{
      title, price
    },
    onSuccess: () => Router.push('/')
  });

  const onSubmit = (event) => {
    event.preventDefault();
    doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);

    if(isNaN(value)){
      return;
    }

    setPrice(value.toFixed(2));

  };

  return (
    <form onSubmit={onSubmit}>
      <h1> Create a ticket </h1>
      <div className="form-group">
        <label>Title</label>
        <input  
          value={title} 
          onChange={e => setTitle(e.target.value)}  
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input 
          value={price} 
          onBlur={onBlur} // on click out input
          onChange={e => setPrice(e.target.value)}  
          className="form-control"
        />
      </div>

      {errors}
      
      <button className="btn btn-primary">Submit</button>
    </form>
  )
};

export default NewTicket;