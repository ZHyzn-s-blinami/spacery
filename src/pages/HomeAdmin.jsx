import React from 'react';
import CoworkingBooking from '../components/reservation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';

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
      <CoworkingBooking isAdmin={true} />
    </>
  );
}

export default HomeAdmin;
