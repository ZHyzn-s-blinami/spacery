import React, { useState } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, ChevronDown, Filter, Search } from 'lucide-react';

const BookingList = () => {
  // Данные о выбранном месте
  const [place, setPlace] = useState({
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    name: "Переговорная 4",
    location: "3 этаж, Восточное крыло",
    capacity: 8,
    amenities: ["Проектор", "Флипчарт", "Видеоконференция"]
  });
  
  // Примерные данные бронирований для этого места
  const initialBookings = [
    {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      userId: "user-1",
      userName: "Алексей Петров",
      placeId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      startAt: "2025-03-01T10:00:00.000Z",
      endAt: "2025-03-01T12:00:00.000Z",
      status: "CONFIRMED",
      createdAt: "2025-02-25T15:30:00.000Z",
      updatedAt: "2025-02-25T16:45:00.000Z"
    },
    {
      id: "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      userId: "user-2",
      userName: "Мария Иванова",
      placeId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      startAt: "2025-03-01T14:00:00.000Z",
      endAt: "2025-03-01T15:30:00.000Z",
      status: "PENDING",
      createdAt: "2025-02-28T09:15:00.000Z",
      updatedAt: "2025-02-28T09:15:00.000Z"
    },
    {
      id: "5fa85f64-5717-4562-b3fc-2c963f66afa8",
      userId: "user-3",
      userName: "Сергей Кузнецов",
      placeId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      startAt: "2025-03-02T11:00:00.000Z",
      endAt: "2025-03-02T13:00:00.000Z",
      status: "CONFIRMED",
      createdAt: "2025-02-26T14:22:00.000Z",
      updatedAt: "2025-02-27T10:05:00.000Z"
    },
    {
      id: "6fa85f64-5717-4562-b3fc-2c963f66afa9",
      userId: "user-4",
      userName: "Елена Смирнова",
      placeId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      startAt: "2025-03-03T09:00:00.000Z",
      endAt: "2025-03-03T11:30:00.000Z",
      status: "CANCELLED",
      createdAt: "2025-02-25T11:10:00.000Z",
      updatedAt: "2025-02-28T16:30:00.000Z"
    }
  ];

  // Состояние для бронирований
  const [bookings, setBookings] = useState(initialBookings);
  const [filterOptions, setFilterOptions] = useState({
    status: "ALL",
    dateFrom: "",
    dateTo: "",
    searchQuery: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    bookingId: null
  });

  // Форматирование даты и времени
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Обработчики действий с бронированиями
  const confirmBooking = (id) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status: "CONFIRMED", updatedAt: new Date().toISOString() } : booking
    ));
    closeModal();
  };

  const cancelBooking = (id) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status: "CANCELLED", updatedAt: new Date().toISOString() } : booking
    ));
    closeModal();
  };

  // Открытие и закрытие модального окна
  const openModal = (action, bookingId) => {
    setConfirmModal({
      open: true,
      action,
      bookingId
    });
  };

  const closeModal = () => {
    setConfirmModal({
      open: false,
      action: null,
      bookingId: null
    });
  };

  // Фильтрация бронирований
  const filteredBookings = bookings.filter(booking => {
    // Фильтр по статусу
    if (filterOptions.status !== "ALL" && booking.status !== filterOptions.status) {
      return false;
    }
    
    // Фильтр по поиску (имя пользователя)
    if (filterOptions.searchQuery && !booking.userName.toLowerCase().includes(filterOptions.searchQuery.toLowerCase())) {
      return false;
    }
    
    // Фильтр по дате "от"
    if (filterOptions.dateFrom) {
      const fromDate = new Date(filterOptions.dateFrom);
      const bookingDate = new Date(booking.startAt);
      if (bookingDate < fromDate) {
        return false;
      }
    }
    
    // Фильтр по дате "до"
    if (filterOptions.dateTo) {
      const toDate = new Date(filterOptions.dateTo);
      const bookingDate = new Date(booking.startAt);
      if (bookingDate > toDate) {
        return false;
      }
    }
    
    return true;
  });

  // Получение класса статуса для визуального отображения
  const getStatusClass = (status) => {
    switch(status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Получение текста статуса на русском
  const getStatusText = (status) => {
    switch(status) {
      case "CONFIRMED":
        return "Подтверждено";
      case "PENDING":
        return "Ожидает подтверждения";
      case "CANCELLED":
        return "Отменено";
      default:
        return status;
    }
  };

  // Получение иконки статуса
  const getStatusIcon = (status) => {
    switch(status) {
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "PENDING":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions({
      ...filterOptions,
      [name]: value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{place.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{place.location}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Вместимость: {place.capacity} человек</span>
              <span className="inline-flex gap-1">
                {place.amenities.map((item, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">{item}</span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Основное содержимое */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Бронирования</h2>
          
          {/* Панель фильтров */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="searchQuery"
                  placeholder="Поиск по имени..."
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
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
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
                      <option value="CONFIRMED">Подтверждено</option>
                      <option value="PENDING">Ожидает подтверждения</option>
                      <option value="CANCELLED">Отменено</option>
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
          
          {/* Таблица бронирований */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата и время</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Создано</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => {
                      const startDate = formatDate(booking.startAt);
                      const startTime = formatTime(booking.startAt);
                      const endTime = formatTime(booking.endAt);
                      
                      return (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                                <div className="text-sm text-gray-500">ID: {booking.userId.substring(0, 8)}...</div>
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
                              <span className={`ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(booking.status)}`}>
                                {getStatusText(booking.status)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.createdAt)}
                            <div className="text-xs text-gray-400">{formatTime(booking.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {booking.status === "PENDING" && (
                                <button
                                  onClick={() => openModal("confirm", booking.id)}
                                  className="text-green-600 hover:text-green-900 py-1 px-2 rounded hover:bg-green-50"
                                >
                                  Подтвердить
                                </button>
                              )}
                              {booking.status !== "CANCELLED" && (
                                <button
                                  onClick={() => openModal("cancel", booking.id)}
                                  className="text-red-600 hover:text-red-900 py-1 px-2 rounded hover:bg-red-50"
                                >
                                  Отменить
                                </button>
                              )}
                            </div>
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
                  {filterOptions.searchQuery || filterOptions.status !== "ALL" || filterOptions.dateFrom || filterOptions.dateTo
                    ? "Попробуйте изменить параметры фильтрации"
                    : "Для этого места пока нет бронирований"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно подтверждения действия */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {confirmModal.action === "confirm" ? "Подтверждение бронирования" : "Отмена бронирования"}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmModal.action === "confirm"
                ? "Вы уверены, что хотите подтвердить это бронирование?"
                : "Вы уверены, что хотите отменить это бронирование? Эту операцию нельзя будет отменить."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={closeModal}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => confirmModal.action === "confirm" 
                  ? confirmBooking(confirmModal.bookingId) 
                  : cancelBooking(confirmModal.bookingId)
                }
                className={`flex-1 py-2 px-4 text-white rounded-lg transition-colors ${
                  confirmModal.action === "confirm"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmModal.action === "confirm" ? "Подтвердить" : "Отменить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;