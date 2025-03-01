import React from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const userToken = localStorage.getItem('userToken');

  const navigate = useNavigate()

  React.useEffect(() => {
    if (!userToken) {
      navigate('/auth');
    }
  }, [userToken])

  return (
    <div>
      <p>имя пользователя</p>
      <p>роль пользовтеля</p>
    </div>
  )
};

export default Profile;