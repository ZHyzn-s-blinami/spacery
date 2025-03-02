import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

function AdminLayout() {
  const userToken = localStorage.getItem('userToken');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!userToken) {
      navigate('/auth');
    } else {
      navigate('/admin');
    }
  }, [userToken]);

  return (
    <>
      <Outlet />
    </>
  );
}

export default AdminLayout;
