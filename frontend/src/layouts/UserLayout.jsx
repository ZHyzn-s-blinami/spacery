import React from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';

function UserLayout() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/auth' && <Header />}
      <Outlet />
    </>
  );
}

export default UserLayout;
