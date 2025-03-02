import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Header from '../components/header.jsx';

function UserLayout() {
  const userToken = localStorage.getItem('userToken');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!userToken) {
      navigate('/auth');
    } else {
      navigate('/');
    }
  }, [userToken]);

  return (
    <>
      <Header />     
      <Outlet />
    </>
  );
}

export default UserLayout;
