import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserData } from '../store/user/thunks';
import { addUser } from '../store/user/slice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [booking, setBooking] = useState(null);

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
          console.error("Ошибка получения данных пользователя:", err);
        });
    }
  }, [userToken, user, dispatch]);

  useEffect(() => {
    if (user && user.id) {
      axios.get(`https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/booking/user`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }})
        .then(response => {
          setBooking(response.data);
        })
        .catch(err => {
          console.error("Ошибка получения данных бронирования:", err);
        });
    }
  }, [user]);

  console.log(user);
  console.log(booking);

  return (
    <div className="p-4">
      {loading && <p>Загрузка данных пользователя...</p>}
      {error && <p className="text-red-600">Ошибка: {error}</p>}
      {user && (
        <div>
          <h1 className="text-2xl font-bold">{user.name}!</h1>
          <h2 className="text-2xl font-bold">{user.role}!</h2>
          {booking && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Список бронирований:</h3>
              <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(booking, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
