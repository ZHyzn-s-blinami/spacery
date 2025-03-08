import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Filter,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { pingService } from '../services/pingService';
import { toastManager } from '../common/toastManager';
import PageTitle from './PageTitle';

const BookingList = () => {
  const { name } = useParams();
  const [place, setPlace] = useState({
    id: '',
    name: '',
    location: '',
    capacity: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
    searchQuery: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

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

  useEffect(() => {
    checkAdminAccess();
    const checkAuth = async () => {
      try {
        await pingService.pong();
      } catch (error) {
        console.error('Auth check failed: ', error);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);

        await checkAuth();

        const placeData = await bookingService.getPlace(name);
        setPlace(placeData);

        const bookingsData = await bookingService.getBooks(name);
        setBookings(bookingsData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    if ((name && location.pathname !== '/') || location.pathname !== '/admin') {
      fetchData();
    }
  }, [name]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const cancelUserMeeting = async (id) => {
    try {
      const response = await bookingService.cancelUserMeeting(id);

      setBookings(
        bookings.map((booking) =>
          booking.bookingId === id
            ? { ...booking, status: 'REJECTED', updatedAt: new Date().toISOString() }
            : booking,
        ),
      );
      toastManager.showSuccessToast('Бронь отменена');
      return response.data;
    } catch (error) {
      toastManager.showErrorToast(error.response.data);
      console.error('Ошибка при отмене брони:', error);
      throw error;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterOptions.status !== 'ALL' && booking.status !== filterOptions.status) {
      return false;
    }

    if (
      filterOptions.searchQuery &&
      !booking.user.email.toLowerCase().includes(filterOptions.searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (filterOptions.dateFrom) {
      const fromDate = new Date(filterOptions.dateFrom);
      const bookingDate = new Date(booking.startAt);
      if (bookingDate < fromDate) {
        return false;
      }
    }

    if (filterOptions.dateTo) {
      const toDate = new Date(filterOptions.dateTo);
      const bookingDate = new Date(booking.startAt);
      if (bookingDate > toDate) {
        return false;
      }
    }

    return true;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Подтверждено';
      case 'PENDING':
        return 'Ожидает подтверждения';
      case 'REJECTED':
        return 'Отменено';
      case 'OVERDUE':
        return 'Просрочено';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'OVERDUE':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions({
      ...filterOptions,
      [name]: value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Список бронирований" />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{place.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{place.description}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">
                Вместимость: {place.capacity} человек
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/admin">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex justify-center items-center transition-all cursor-pointer">
              <ArrowLeft /> Назад
            </button>
          </Link>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Бронирования</h2>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="searchQuery"
                  placeholder="Поиск по почте..."
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterOptions.searchQuery}
                  onChange={handleFilterChange}
                />
              </div>

              <button
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span>Фильтры</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilters ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                    <select
                      name="status"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={filterOptions.status}
                      onChange={handleFilterChange}
                    >
                      <option value="ALL">Все статусы</option>
                      <option value="ACCEPTED">Подтверждено</option>
                      <option value="PENDING">Ожидает подтверждения</option>
                      <option value="REJECTED">Отменено</option>
                      <option value="OVERDUE">Просрочено</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата от</label>
                    <input
                      type="date"
                      name="dateFrom"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={filterOptions.dateFrom}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата до</label>
                    <input
                      type="date"
                      name="dateTo"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={filterOptions.dateTo}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Пользователь
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Дата и время
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Статус
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Создано
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking, i) => {
                      const startDate = formatDate(booking.startAt);
                      const startTime = formatTime(booking.startAt);
                      const endTime = formatTime(booking.endAt);

                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.user
                                    ? booking.user.active === true
                                      ? 'Email:' + booking.user.email.substring(0, 8) + '...'
                                      : 'Пользователь заблокирован'
                                    : 'Пользователь удалён'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="flex items-center text-sm text-gray-900">
                                <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                                {startDate}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                {startTime} - {endTime}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(booking.status)}
                              <span
                                className={`ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                  booking.status,
                                )}`}
                              >
                                {getStatusText(booking.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.createdAt)}
                            <div className="text-xs text-gray-400">
                              {formatTime(booking.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {booking.status !== 'REJECTED' &&
                              booking.status !== 'OVERDUE' &&
                              booking.status !== 'ACCEPTED' && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="text-red-600 hover:text-red-900 py-1 px-2 rounded hover:bg-red-50"
                                    onClick={() => cancelUserMeeting(booking.bookingId)}
                                  >
                                    Отменить
                                  </button>
                                </div>
                              )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Бронирований не найдено</h3>
                <p className="text-gray-500">
                  {filterOptions.searchQuery ||
                  filterOptions.status !== 'ALL' ||
                  filterOptions.dateFrom ||
                  filterOptions.dateTo
                    ? 'Попробуйте изменить параметры фильтрации'
                    : 'Для этого места пока нет бронирований'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingList;
