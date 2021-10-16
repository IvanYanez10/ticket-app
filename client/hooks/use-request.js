import { useState } from 'react';
import axios from 'axios';

const use_request = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try{
      setErrors(null);
      const response = await axios[method](url, body);
      if(onSuccess){
        onSuccess(response.data);
      }
      return response.data;
    }catch(err){
      setErrors(
        <div className="alert alert-danger">
        <h1>Ooops...</h1>
        <ul className="my-0">
          {err.response.data.errors.map(err => 
          <li key={err.message}>{err.message}</li>)}
        </ul>
      </div>
      );
    }
  }

  return {doRequest, errors};

};

export default use_request;