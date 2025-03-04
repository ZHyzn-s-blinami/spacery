import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchUserData } from '../store/user/thunks';
import { addUser } from '../store/user/slice';
import CoworkingBooking from '../components/reservation';
import PageTitle from './PageTitle';

function Home() {
  const dispatch = useDispatch();
  const userToken = localStorage.getItem('userToken');
  const { user, loading, error } = useSelector((state) => state.user);

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
    <div>
      <PageTitle title="Главная" />
      <CoworkingBooking isAdmin={false} />
    </div>
  );
}

export default Home;
