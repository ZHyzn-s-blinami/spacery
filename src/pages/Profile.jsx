import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserData } from '../store/user/thunks';
import { addUser } from '../store/user/slice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  
  const { user, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userToken) {
      navigate('/auth');
    }
  }, [userToken, navigate]);

  useEffect(() => {
    if (userToken && !user) {
      dispatch(fetchUserData())
        .then((result) => {
          dispatch(addUser(result.payload));
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [userToken, user, dispatch]);

  console.log(user)

  return (
    <div>
      <p>{user.name}</p>
      <p>{user.role}</p>
    </div>  );
};

export default Profile;
