import axios from 'axios';

export default () => {
  if(typeof window === 'undefined'){
    // we are on server!
    return axios.create({
      baseURL: 'http://ingress-nginx.ingress-nginx-controller.svc.clouster.local', 
      headers: req.headers      
    });
  }else{
    // we are on browser
    return axios.create({
      baseURL: '/'   
    });
  }
};