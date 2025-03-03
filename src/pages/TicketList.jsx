import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import {
  Ticket,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Filter,
  Search,
  Trash,
  Coffee,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { pingService } from '../services/pingService';
import { ticketService } from '../services/ticketService';
import { placeService } from '../services/placeService';

function TicketList() {
  const { name } = useParams();
  const [place, setPlace] = useState({
    id: '',
    name: '',
    location: '',
    capacity: 0,
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    status: 'ALL',
    ticketType: 'ALL',
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
        console.log(response.status);
        navigate('/');
      }
    } catch (error) {
      console.log(error);
      navigate('/');
    }
  };

  useEffect(() => {
    checkAdminAccess();

    const fetchData = async () => {
      try {
        setLoading(true);

        // Получаем информацию о месте
        if (name) {
          const placeData = await placeService.getByName(name);
          setPlace(placeData);
        }

        // Получаем список тикетов
        const ticketsData = await ticketService.getByPlace(name);
        setTickets(ticketsData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const updateTicketStatus = async (id, newStatus) => {
    try {
      const response = await ticketService.updateTicketStatus(id, newStatus);

      setTickets(
        tickets.map((ticket) =>
          ticket.id === id
            ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
            : ticket,
        ),
      );
      toast.success(`Статус тикета изменен на "${getStatusText(newStatus)}"`);
      return response.data;
    } catch (error) {
      toast.error('Ошибка при обновлении статуса тикета');
      console.error('Ошибка при обновлении статуса тикета:', error);
      throw error;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filterOptions.status !== 'ALL' && ticket.status !== filterOptions.status) {
      return false;
    }

    if (filterOptions.ticketType !== 'ALL' && ticket.ticketType !== filterOptions.ticketType) {
      return false;
    }

    if (
      filterOptions.searchQuery &&
      !ticket.description.toLowerCase().includes(filterOptions.searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (filterOptions.dateFrom) {
      const fromDate = new Date(filterOptions.dateFrom);
      const ticketDate = new Date(ticket.createdAt);
      if (ticketDate < fromDate) {
        return false;
      }
    }

    if (filterOptions.dateTo) {
      const toDate = new Date(filterOptions.dateTo);
      const ticketDate = new Date(ticket.createdAt);
      if (ticketDate > toDate) {
        return false;
      }
    }

    return true;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CLOSED':
        return 'Закрыт';
      case 'IN_PROGRESS':
        return 'В работе';
      case 'OPEN':
        return 'Открыт';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CLOSED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'OPEN':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getTicketTypeText = (type) => {
    switch (type) {
      case 'CLEANING':
        return 'Уборка';
      case 'TECHNICAL_PROBLEM':
        return 'Техническая проблема';
      case 'FOOD':
        return 'Еда';
      case 'PLACE_TAKEN':
        return 'Место занято';
      case 'OTHER':
        return 'Другое';
      default:
        return type;
    }
  };

  const getTicketTypeIcon = (type) => {
    switch (type) {
      case 'CLEANING':
        return <Trash className="h-5 w-5 text-blue-600" />;
      case 'TECHNICAL_PROBLEM':
        return <Tool className="h-5 w-5 text-orange-600" />;
      case 'FOOD':
        return <Coffee className="h-5 w-5 text-green-600" />;
      case 'PLACE_TAKEN':
        return <MapPin className="h-5 w-5 text-red-600" />;
      case 'OTHER':
        return <HelpCircle className="h-5 w-5 text-purple-600" />;
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
      {/* Шапка */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Список тикетов{place.name ? `: ${place.name}` : ''}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {place.description || 'Управление заявками на обслуживание помещений'}
              </p>
            </div>
            {place.id && (
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">
                  Вместимость: {place.capacity} человек
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Основное содержимое */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Заявки на обслуживание</h2>

          {/* Панель фильтров */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="searchQuery"
                  placeholder="Поиск по описанию..."
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                    <select
                      name="status"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={filterOptions.status}
                      onChange={handleFilterChange}
                    >
                      <option value="ALL">Все статусы</option>
                      <option value="OPEN">Открыт</option>
                      <option value="IN_PROGRESS">В работе</option>
                      <option value="CLOSED">Закрыт</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип тикета
                    </label>
                    <select
                      name="ticketType"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={filterOptions.ticketType}
                      onChange={handleFilterChange}
                    >
                      <option value="ALL">Все типы</option>
                      <option value="CLEANING">Уборка</option>
                      <option value="TECHNICAL_PROBLEM">Техническая проблема</option>
                      <option value="FOOD">Еда</option>
                      <option value="PLACE_TAKEN">Место занято</option>
                      <option value="OTHER">Другое</option>
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

          {/* Таблица тикетов */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {filteredTickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Тип
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Описание
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
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTicketTypeIcon(ticket.ticketType)}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {getTicketTypeText(ticket.ticketType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {ticket.description.length > 50
                              ? ticket.description.substring(0, 50) + '...'
                              : ticket.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(ticket.status)}
                            <span
                              className={`ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                ticket.status,
                              )}`}
                            >
                              {getStatusText(ticket.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ticket.createdAt)}
                          <div className="text-xs text-gray-400">
                            {formatTime(ticket.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {ticket.status === 'OPEN' && (
                              <button
                                className="text-yellow-600 hover:text-yellow-900 py-1 px-2 rounded hover:bg-yellow-50"
                                onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                              >
                                Взять в работу
                              </button>
                            )}
                            {ticket.status === 'IN_PROGRESS' && (
                              <button
                                className="text-green-600 hover:text-green-900 py-1 px-2 rounded hover:bg-green-50"
                                onClick={() => updateTicketStatus(ticket.id, 'CLOSED')}
                              >
                                Закрыть
                              </button>
                            )}
                            {ticket.status === 'OPEN' && (
                              <button
                                className="text-green-600 hover:text-green-900 py-1 px-2 rounded hover:bg-green-50"
                                onClick={() => updateTicketStatus(ticket.id, 'CLOSED')}
                              >
                                Закрыть
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                  <Ticket className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Тикетов не найдено</h3>
                <p className="text-gray-500">
                  {filterOptions.searchQuery ||
                  filterOptions.status !== 'ALL' ||
                  filterOptions.ticketType !== 'ALL' ||
                  filterOptions.dateFrom ||
                  filterOptions.dateTo
                    ? 'Попробуйте изменить параметры фильтрации'
                    : 'Для этого места пока нет тикетов'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TicketList;
