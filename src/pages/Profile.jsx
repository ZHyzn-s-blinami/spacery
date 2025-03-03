import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from '../store/user/thunks';
import { addUser } from '../store/user/slice';
import MeetingList from '../components/user/MeetingsList';
import { UserIcon, ShieldCheckIcon, CalendarIcon, LogOutIcon } from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const userToken = localStorage.getItem('userToken');
  const { user, loading, error } = useSelector((state) => state.user);

  const handleVerification = () => {
    // Аунтификация хз, что тут сделать
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    location.reload();
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gray-300 mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded shadow-sm">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Произошла ошибка</h2>
          <p className="text-red-600">{error.message}</p>{' '}
          {/* Исправлено: выводим только сообщение об ошибке */}
          <button
            onClick={() => dispatch(fetchUserData())}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Профиль пользователя */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-blue-600 px-6 py-8 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <UserIcon size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-blue-100">{user.role}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleVerification}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center transition-all cursor-pointer"
                >
                  <ShieldCheckIcon size={18} className="mr-2" />
                  <span>Верификация</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-all cursor-pointer"
                >
                  <LogOutIcon size={18} className="mr-2" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b px-6">
            <div className="flex -mb-px">
              <div className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm flex items-center">
                <CalendarIcon size={18} className="mr-2" />
                Предстоящие встречи
              </div>
            </div>
          </div>

          <div className="p-6">
            <MeetingList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
