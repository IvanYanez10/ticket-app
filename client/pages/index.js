import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return currentUser 
  ? <h1>Youre singnin</h1> 
  : <h1>Youre not signin</h1>;
};

// generated in server
LandingPage.getInitialProps = async context => {
  const client = buildClient(context);
  const { data } = await client
  .get('/api/users/currentuser');
  return data;
};

export default LandingPage;