import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData, fetchUserMeetings } from '../store/user/thunks';
import { addUser } from '../store/user/slice';
import MeetingList from '../components/user/MeetingsList';

const Profile = () => {
  const dispatch = useDispatch();
  const userToken = localStorage.getItem('userToken');
  const { user, loading, error } = useSelector((state) => state.user);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    location.reload()
  }

  useEffect(() => {
    if (userToken && !user) {
      dispatch(fetchUserData())
         .then((result) => {
           dispatch(addUser(result.payload));
        })
        .catch((err) => {
          console.error('Ошибка получения данных пользователя:', err);
        });
    }
  }, [userToken, user, dispatch]);

  return (
    <div className="p-4">
      {loading && <p>Загрузка данных пользователя...</p>}
      {error && <p className="text-red-600">Ошибка: {error}</p>}
      {user && (
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <h2 className="text-2xl font-bold">{user.role}</h2>
          <MeetingList/>
          <button onClick={handleLogout}>Выйти из аккаунта</button>
        </div>
      )}
    </div>
  );
};

export default Profile;