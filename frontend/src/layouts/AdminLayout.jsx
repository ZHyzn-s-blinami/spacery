import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader.jsx';

function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <Outlet />
    </>
  );
}

export default AdminLayout;
