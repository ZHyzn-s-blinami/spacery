import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';

function UserLayout() {
  const userToken = localStorage.getItem('userToken');
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!userToken) {
      navigate('/auth');
    } else {
      navigate('/');
    }
  }, [userToken]);

  return (
    <>
      {location.pathname !== '/auth' && <Header />}
      <Outlet />
    </>
  );
}

export default UserLayout;
