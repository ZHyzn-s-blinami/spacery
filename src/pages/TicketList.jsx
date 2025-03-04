import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import {
  Ticket,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Trash,
  Coffee,
  MapPin,
  HelpCircle,
  Clock,
  Calendar,
  RefreshCw,
  ServerCrash,
  MoreHorizontal,
} from 'lucide-react';

import { ticketService } from '../services/ticketService';
import { toastManager } from '../common/toastManager';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { ChevronRight, BarChart2 } from 'lucide-react';
import PageTitle from './PageTitle';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    status: 'ALL',
    ticketType: 'ALL',
    zone: 'ALL',
    dateFrom: '',
    dateTo: '',
    searchQuery: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [zones, setZones] = useState([]);

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsModalMounted, setStatsModalMounted] = useState(false);
  const [isStatsModalClosing, setIsStatsModalClosing] = useState(false);

  const navigate = useNavigate();
  const [expandedTickets, setExpandedTickets] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

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

  const fetchData = async () => {
    try {
      setLoading(true);

      const ticketsData = await ticketService.getAll();
      setTickets(ticketsData);

      const uniqueZones = [...new Set(ticketsData.map((ticket) => ticket.zone).filter(Boolean))];
      setZones(uniqueZones);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      toastManager.showSuccessToast('Данные обновлены');
    } catch (err) {
      toastManager.showErrorToast('Не удалось обновить данные');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleDescriptionExpand = (ticketId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
  };

  const setZoneText = (zone) => {
    switch (zone) {
      case 'A':
        return 'Зона A: Опен-спейс';
      case 'B':
        return 'Зона B: Кабинеты';
      case 'C':
        return 'Зона C: Переговорные';
      case 'D':
        return 'Зона D: Тихая зона';
      case 'E':
        return 'Зона E: Зона отдыха';
      default:
        return zone || '-';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'только что';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} мин. назад`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ч. назад`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} д. назад`;
    }
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
      toastManager.showSuccessToast(`Статус тикета изменен на "${getStatusText(newStatus)}"`);
      return response.data;
    } catch (error) {
      toastManager.showErrorToast('Ошибка при обновлении статуса тикета');
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

    if (filterOptions.zone !== 'ALL' && ticket.zone !== filterOptions.zone) {
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OPEN':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'OPEN':
        return <XCircle className="h-4 w-4 text-red-600" />;
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
        return <Trash className="h-4 w-4 text-blue-600" />;
      case 'TECHNICAL_PROBLEM':
        return <ServerCrash className="h-4 w-4 text-orange-600" />;
      case 'FOOD':
        return <Coffee className="h-4 w-4 text-green-600" />;
      case 'PLACE_TAKEN':
        return <MapPin className="h-4 w-4 text-red-600" />;
      case 'OTHER':
        return <HelpCircle className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getTicketTypeClass = (type) => {
    switch (type) {
      case 'CLEANING':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'TECHNICAL_PROBLEM':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'FOOD':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'PLACE_TAKEN':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'OTHER':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions({
      ...filterOptions,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilterOptions({
      status: 'ALL',
      ticketType: 'ALL',
      zone: 'ALL',
      dateFrom: '',
      dateTo: '',
      searchQuery: '',
    });
  };

  const toggleTicketExpand = (ticketId) => {
    setExpandedTickets((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
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
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  const openStatsModal = () => {
    setShowStatsModal(true);
    setTimeout(() => setStatsModalMounted(true), 50);
  };

  const closeStatsModal = () => {
    setIsStatsModalClosing(true);
    setTimeout(() => {
      setShowStatsModal(false);
      setIsStatsModalClosing(false);
      setStatsModalMounted(false);
    }, 300);
  };

  const prepareChartData = () => {
    const statusData = [
      { name: 'Открыт', value: tickets.filter((t) => t.status === 'OPEN').length },
      { name: 'В работе', value: tickets.filter((t) => t.status === 'IN_PROGRESS').length },
      { name: 'Закрыт', value: tickets.filter((t) => t.status === 'CLOSED').length },
    ];

    const typeData = [
      { name: 'Уборка', value: tickets.filter((t) => t.ticketType === 'CLEANING').length },
      {
        name: 'Тех. проблемы',
        value: tickets.filter((t) => t.ticketType === 'TECHNICAL_PROBLEM').length,
      },
      { name: 'Еда', value: tickets.filter((t) => t.ticketType === 'FOOD').length },
      { name: 'Место занято', value: tickets.filter((t) => t.ticketType === 'PLACE_TAKEN').length },
      { name: 'Другое', value: tickets.filter((t) => t.ticketType === 'OTHER').length },
    ];

    const zonesData = zones.map((zone) => ({
      name: zone || 'Не указано',
      value: tickets.filter((t) => t.zone === zone).length,
    }));

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const timeData = last7Days.map((date) => {
      const dateString = date.toISOString().split('T')[0];
      return {
        name: formatDate(date),
        value: tickets.filter((t) => t.createdAt.startsWith(dateString)).length,
      };
    });

    return { statusData, typeData, zonesData, timeData };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Список тикетов" />
      <header className="bg-white pb-4 shadow-sm shadow-b-2 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex items-start md:items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3 hidden sm:block">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  Список тикетов
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Управление заявками на обслуживание помещений
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Заявки
              {filteredTickets.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredTickets.length})
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={openStatsModal}
                className="inline-flex cursor-pointer items-center px-3 py-2 bg-indigo-50 border border-indigo-300 rounded-lg text-sm text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Статистика
              </button>
              <button
                onClick={refreshData}
                className="inline-flex items-center px-3 py-2 bg-white border cursor-pointer border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Обновить
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="searchQuery"
                  placeholder="Поиск по описанию..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={filterOptions.searchQuery}
                  onChange={handleFilterChange}
                />
              </div>

              <button
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 duration-200 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span>Фильтры</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    showFilters ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-400 ease ${
                showFilters ? 'max-h-126 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
              }`}
            >
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                    <select
                      name="status"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Зона</label>
                    <select
                      name="zone"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      value={filterOptions.zone}
                      onChange={handleFilterChange}
                    >
                      <option value="ALL">Все зоны</option>
                      {zones.map((zone) => (
                        <option key={zone} value={zone}>
                          {setZoneText(zone)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Дата от
                    </label>
                    <input
                      type="date"
                      name="dateFrom"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      value={filterOptions.dateFrom}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Дата до
                    </label>
                    <input
                      type="date"
                      name="dateTo"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      value={filterOptions.dateTo}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6 lg:hidden">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-lg border ${getTicketTypeClass(
                            ticket.ticketType,
                          )}`}
                        >
                          {getTicketTypeIcon(ticket.ticketType)}
                          <span className="ml-1 text-xs font-medium">
                            {getTicketTypeText(ticket.ticketType)}
                          </span>
                        </div>
                        <div
                          className={`ml-2 inline-flex items-center px-2 py-1 rounded-lg border ${getStatusClass(
                            ticket.status,
                          )}`}
                        >
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 text-xs font-medium">
                            {getStatusText(ticket.status)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeAgo(ticket.createdAt)}
                      </div>
                    </div>

                    <div className="mb-2">
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out text-sm text-gray-800 break-words break-all w-full`}
                        style={{
                          maxHeight: expandedDescriptions[ticket.id] ? '200px' : '40px',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {ticket.description}
                      </div>

                      {ticket.description.length > 50 && (
                        <button
                          onClick={() => toggleDescriptionExpand(ticket.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                        >
                          {expandedDescriptions[ticket.id] ? 'Свернуть' : 'Подробнее'}
                          <div className="relative w-4 h-4 ml-0.5 flex items-center justify-center">
                            <ChevronDown
                              className={`absolute transition-transform duration-300 ease-in-out h-3 w-3 ${
                                expandedDescriptions[ticket.id] ? 'transform rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => toggleTicketExpand(ticket.id)}
                      className={`w-full flex items-center justify-center py-1.5 px-3 mb-3 rounded-md border transition-all duration-300 ${
                        expandedTickets[ticket.id]
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs font-medium mr-1.5">
                        {expandedTickets[ticket.id] ? 'Скрыть детали' : 'Показать детали'}
                      </span>
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        <ChevronDown
                          size={14}
                          className={`absolute transition-transform duration-300 ease-in-out ${
                            expandedTickets[ticket.id]
                              ? 'opacity-0 transform rotate-180'
                              : 'opacity-100'
                          }`}
                        />
                        <ChevronUp
                          size={14}
                          className={`absolute transition-transform duration-300 ease-in-out ${
                            expandedTickets[ticket.id]
                              ? 'opacity-100'
                              : 'opacity-0 transform -rotate-180'
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        expandedTickets[ticket.id] ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden min-h-0">
                        <div
                          className={`space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-100 mb-3 transition-opacity duration-300 ${
                            expandedTickets[ticket.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Создано:</span>{' '}
                            {formatDate(ticket.createdAt)} в {formatTime(ticket.createdAt)}
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Последнее обновление:</span>{' '}
                            {ticket.updatedAt
                              ? `${formatDate(ticket.updatedAt)} в ${formatTime(ticket.updatedAt)}`
                              : 'Не обновлялся'}
                          </div>
                          {ticket.assignedTo && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Назначен:</span> {ticket.assignedTo}
                            </div>
                          )}
                          {ticket.zone && (
                            <div className="text-xs text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="font-medium">Зона:</span> {ticket.zone}
                            </div>
                          )}
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">ID тикета:</span> {ticket.id}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!expandedTickets[ticket.id] && ticket.zone && (
                      <div className="mb-3 text-xs text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Зона: {ticket.zone}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        ID: {ticket.id.substring(0, 8)}...
                      </div>
                      <div className="flex space-x-2">
                        {ticket.status === 'OPEN' && (
                          <button
                            className="text-xs bg-yellow-50 text-yellow-700 py-1 px-3 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
                            onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                          >
                            Взять в работу
                          </button>
                        )}
                        {(ticket.status === 'IN_PROGRESS' || ticket.status === 'OPEN') && (
                          <button
                            className="text-xs bg-green-50 text-green-700 py-1 px-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                            onClick={() => updateTicketStatus(ticket.id, 'CLOSED')}
                          >
                            Закрыть
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                  <Ticket className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Тикетов не найдено</h3>
                <p className="text-gray-500">
                  {filterOptions.searchQuery ||
                  filterOptions.status !== 'ALL' ||
                  filterOptions.ticketType !== 'ALL' ||
                  filterOptions.zone !== 'ALL' ||
                  filterOptions.dateFrom ||
                  filterOptions.dateTo
                    ? 'Попробуйте изменить параметры фильтрации'
                    : 'Для этого места пока нет тикетов'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden hidden lg:block">
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
                        Зона
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
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-lg border ${getTicketTypeClass(
                              ticket.ticketType,
                            )}`}
                          >
                            {getTicketTypeIcon(ticket.ticketType)}
                            <span className="ml-1 text-xs font-medium">
                              {getTicketTypeText(ticket.ticketType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out text-sm text-gray-900 break-words break-all w-full`}
                              style={{
                                maxHeight: expandedDescriptions[ticket.id] ? '200px' : '40px',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                              }}
                            >
                              {ticket.description}
                            </div>

                            {ticket.description.length > 50 && (
                              <button
                                onClick={() => toggleDescriptionExpand(ticket.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                              >
                                {expandedDescriptions[ticket.id] ? 'Свернуть' : 'Подробнее'}
                                <div className="relative w-4 h-4 ml-0.5 flex items-center justify-center">
                                  <ChevronDown
                                    className={`absolute transition-transform duration-300 ease-in-out h-3 w-3 ${
                                      expandedDescriptions[ticket.id] ? 'transform rotate-180' : ''
                                    }`}
                                  />
                                </div>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{ticket.zone || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-lg border ${getStatusClass(
                              ticket.status,
                            )}`}
                          >
                            {getStatusIcon(ticket.status)}
                            <span className="ml-1 text-xs font-medium">
                              {getStatusText(ticket.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(ticket.createdAt)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTime(ticket.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {ticket.status === 'OPEN' && (
                              <button
                                className="text-yellow-600 hover:text-yellow-900 py-1 px-3 rounded-lg hover:bg-yellow-50 transition-colors"
                                onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                              >
                                Взять в работу
                              </button>
                            )}
                            {(ticket.status === 'IN_PROGRESS' || ticket.status === 'OPEN') && (
                              <button
                                className="text-green-600 hover:text-green-900 py-1 px-3 rounded-lg hover:bg-green-50 transition-colors"
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
                  filterOptions.zone !== 'ALL' ||
                  filterOptions.dateFrom ||
                  filterOptions.dateTo
                    ? 'Попробуйте изменить параметры фильтрации'
                    : 'Для этого места пока нет тикетов'}
                </p>
              </div>
            )}
          </div>
        </div>
        {showStatsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 transition-all duration-300 ease-in-out"
              style={{
                backdropFilter:
                  statsModalMounted && !isStatsModalClosing ? 'blur(5px)' : 'blur(0px)',
                backgroundColor:
                  statsModalMounted && !isStatsModalClosing
                    ? 'rgba(0, 0, 0, 0.2)'
                    : 'rgba(0, 0, 0, 0)',
              }}
              onClick={closeStatsModal}
            ></div>

            <div
              className={`relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden z-50 transition-all duration-300 ${
                isStatsModalClosing
                  ? 'opacity-0 transform scale-95'
                  : statsModalMounted
                  ? 'opacity-100 transform scale-100'
                  : 'opacity-0 transform scale-95'
              }`}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-medium text-gray-800 flex items-center">
                  <BarChart2 className="h-6 w-6 mr-3 text-blue-600" />
                  Статистика по тикетам
                </h3>
                <button
                  onClick={closeStatsModal}
                  className="rounded-full p-1.5 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none transition-colors"
                >
                  <XCircle className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                {(() => {
                  const { statusData, typeData, zonesData, timeData } = prepareChartData();

                  return (
                    <>
                      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h4 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
                          <span className="w-2 h-6 bg-gray-600 rounded-sm mr-3"></span>
                          Общая сводка
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 flex flex-col">
                            <span className="text-xs text-blue-700 uppercase font-semibold tracking-wider mb-2">
                              Всего тикетов
                            </span>
                            <span className="text-3xl font-bold text-blue-800">
                              {tickets.length}
                            </span>
                          </div>

                          <div className="bg-red-50 p-5 rounded-lg border border-red-100 flex flex-col">
                            <span className="text-xs text-red-700 uppercase font-semibold tracking-wider mb-2">
                              Открытых
                            </span>
                            <span className="text-3xl font-bold text-red-800">
                              {tickets.filter((t) => t.status === 'OPEN').length}
                            </span>
                          </div>

                          <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100 flex flex-col">
                            <span className="text-xs text-yellow-700 uppercase font-semibold tracking-wider mb-2">
                              В работе
                            </span>
                            <span className="text-3xl font-bold text-yellow-800">
                              {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
                            </span>
                          </div>

                          <div className="bg-green-50 p-5 rounded-lg border border-green-100 flex flex-col">
                            <span className="text-xs text-green-700 uppercase font-semibold tracking-wider mb-2">
                              Закрытых
                            </span>
                            <span className="text-3xl font-bold text-green-800">
                              {tickets.filter((t) => t.status === 'CLOSED').length}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <h4 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
                            <span className="w-2 h-6 bg-blue-600 rounded-sm mr-3"></span>
                            Тикеты по статусам
                          </h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) =>
                                  `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                <Cell fill="#ef4444" />
                                <Cell fill="#f59e0b" />
                                <Cell fill="#10b981" />
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <h4 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
                            <span className="w-2 h-6 bg-indigo-600 rounded-sm mr-3"></span>
                            Тикеты по типам
                          </h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={typeData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Количество" fill="#6366f1" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <h4 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
                            <span className="w-2 h-6 bg-cyan-600 rounded-sm mr-3"></span>
                            Распределение по зонам
                          </h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={zonesData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="name" />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Количество" fill="#0ea5e9" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <h4 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
                            <span className="w-2 h-6 bg-purple-600 rounded-sm mr-3"></span>
                            Динамика создания тикетов
                          </h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timeData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="value"
                                name="Количество"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TicketList;
