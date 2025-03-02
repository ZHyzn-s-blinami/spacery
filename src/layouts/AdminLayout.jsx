import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader.jsx";

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
      {location.pathname !== '/auth' && <AdminHeader />}
      <Outlet />
    </>
  );
}

export default AdminLayout;
