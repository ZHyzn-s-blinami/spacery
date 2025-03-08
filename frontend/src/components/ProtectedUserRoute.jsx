import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function ProtectedUserRoute({ children }) {
  const [userRole, setUserRole] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAuth = async () => {
      const userToken = localStorage.getItem('userToken');

      if (!userToken) {
        navigate('/auth');
        return;
      }

      const userData = await authService.getUser();
      if (userData) {
        setUserRole(userData.role);

        if (userData.role === 'ROLE_ADMIN') {
          navigate('/admin');
        }
      } else {
        navigate('/auth');
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  return userRole !== 'ROLE_ADMIN' ? children : null;
}

export default ProtectedUserRoute;
