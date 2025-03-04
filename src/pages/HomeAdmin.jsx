import React from 'react';
import CoworkingBooking from '../components/reservation';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import PageTitle from './PageTitle';

function HomeAdmin() {
  const navigate = useNavigate();
  React.useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await adminService.admin_only();
      if (response.status !== 200) {
        navigate('/');
      }
    } catch (error) {
      navigate('/');
    }
  };
  return (
    <>
      <PageTitle title="Карта коворкинга" />
      <CoworkingBooking isAdmin={true} />
    </>
  );
}

export default HomeAdmin;
