import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  PenLine,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

import { toastManager } from '../common/toastManager';
import PageTitle from './PageTitle';

const UserControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState({});

  const [filterOptions, setFilterOptions] = useState({
    role: 'ALL',
    status: 'ALL',
    verified: 'ALL',
    dateFrom: '',
    dateTo: '',
    searchQuery: '',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    email: '',
    password: '',
  });
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'ROLE_USER',
  });
  const [createMessage, setCreateMessage] = useState(null);
  const [createError, setCreateError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const [columnWidths, setColumnWidths] = useState({
    id: 80,
    email: 150,
    name: 100,
    active: 80,
    description: 150,
    verified: 90,
    createdAt: 120,
    role: 90,
    actions: 120,
  });
  const [resizingColumn, setResizingColumn] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const tableRef = useRef(null);

  const toggleUserExpand = (userId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const [editModalClosing, setEditModalClosing] = useState(false);
  const [deleteModalClosing, setDeleteModalClosing] = useState(false);
  const [createModalClosing, setCreateModalClosing] = useState(false);

  const [editModalAppearing, setEditModalAppearing] = useState(false);
  const [deleteModalAppearing, setDeleteModalAppearing] = useState(false);
  const [createModalAppearing, setCreateModalAppearing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingColumn) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, startX, startWidth]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        'localhost:8080/api/user/all',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Ошибка при получении списка пользователей',
      );
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
      showLimitedToast('Данные обновлены', 'success');
    } catch (err) {
      showLimitedToast('Не удалось обновить данные', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
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

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      description: user.description || '',
      email: user.email || '',
      password: '',
    });
    setUpdateMessage(null);
    setUpdateError(null);
    setShowEditModal(true);

    setEditModalAppearing(true);
    setTimeout(() => {
      setEditModalAppearing(false);
    }, 50);
  };

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setDeleteMessage(null);
    setDeleteError(null);
    setShowDeleteModal(true);

    setDeleteModalAppearing(true);
    setTimeout(() => {
      setDeleteModalAppearing(false);
    }, 50);
  };

  const handleCreateClick = () => {
    setCreateFormData({
      email: '',
      password: '',
      name: '',
      role: 'ROLE_USER',
    });
    setCreateMessage(null);
    setCreateError(null);
    setShowCreateModal(true);

    setCreateModalAppearing(true);
    setTimeout(() => {
      setCreateModalAppearing(false);
    }, 50);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({
      ...createFormData,
      [name]: value,
    });
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
      role: 'ALL',
      status: 'ALL',
      verified: 'ALL',
      dateFrom: '',
      dateTo: '',
      searchQuery: '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const payload = {};
    for (const [key, value] of Object.entries(editFormData)) {
      if (value.trim() !== '') {
        payload[key] = value;
      }
    }

    try {
      setUpdateError(null);
      setUpdateMessage(null);

      const token = localStorage.getItem('userToken');
      await axios.put(
        `localhost:8080/api/user/edit/${editingUser.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setUpdateMessage('Пользователь успешно обновлен');

      fetchUsers();

      setTimeout(() => {
        closeEditModal();
      }, 1000);
    } catch (err) {
      setUpdateError(
        err.response?.data?.message || err.message || 'Ошибка при обновлении пользователя',
      );
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      setCreateError(null);
      setCreateMessage(null);

      if (!createFormData.email || !createFormData.password) {
        setCreateError('Email и пароль обязательны');
        return;
      }

      const token = localStorage.getItem('userToken');
      await axios.post(
        'localhost:8080/api/user/sign-up',
        createFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setCreateMessage('Пользователь успешно создан');

      fetchUsers();

      setTimeout(() => {
        closeCreateModal();
      }, 1000);
    } catch (err) {
      setCreateError(
        err.response?.data?.message || err.message || 'Ошибка при создании пользователя',
      );
    }
  };

  const verifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(
          `localhost:8080/api/user/verify/${userId}`,
          { verified: true },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
      );
      toastManager.showSuccessToast('Пользователь верифицирован');
      fetchUsers();
    } catch (err) {
      console.error('Error verifying user:', err);
      toastManager.showErrorToast('Не удалось верифицировать пользователя');
    }
  };


  const handleDeleteSubmit = async () => {
    try {
      setDeleteError(null);
      setDeleteMessage(null);

      const token = localStorage.getItem('userToken');
      await axios.delete(
        `localhost:8080/api/user/delete/${deletingUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setDeleteMessage('Пользователь успешно удален');

      fetchUsers();

      setTimeout(() => {
        closeDeleteModal();
      }, 1000);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || err.message || 'Ошибка при удалении пользователя',
      );
    }
  };

  const handleResizeStart = (columnName, e) => {
    setResizingColumn(columnName);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnName]);
  };

  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(
        `localhost:8080/api/user/block/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      toastManager.showSuccessToast('Пользователь заблокирован');
      fetchUsers();
    } catch (err) {
      console.error('Error blocking user:', err);
      toastManager.showErrorToast('Не удалось заблокировать пользователя');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(
        `localhost:8080/api/user/unblock/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      toastManager.showSuccessToast('Пользователь разблокирован');
      fetchUsers();
    } catch (err) {
      console.error('Error unblocking user:', err);
      toastManager.showErrorToast('Не удалось разблокировать пользователя');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filterOptions.role !== 'ALL' && user.role !== filterOptions.role) {
      return false;
    }

    if (filterOptions.status !== 'ALL') {
      if (filterOptions.status === 'ACTIVE' && !user.active) {
        return false;
      }
      if (filterOptions.status === 'INACTIVE' && user.active) {
        return false;
      }
    }

    if (filterOptions.verified !== 'ALL') {
      if (filterOptions.verified === 'VERIFIED' && !user.verified) {
        return false;
      }
      if (filterOptions.verified === 'UNVERIFIED' && user.verified) {
        return false;
      }
    }

    if (
      filterOptions.searchQuery &&
      !user.email.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) &&
      !user.name?.toLowerCase().includes(filterOptions.searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (filterOptions.dateFrom) {
      const fromDate = new Date(filterOptions.dateFrom);
      const userDate = new Date(user.createdAt);
      if (userDate < fromDate) {
        return false;
      }
    }

    if (filterOptions.dateTo) {
      const toDate = new Date(filterOptions.dateTo);
      const userDate = new Date(user.createdAt);
      if (userDate > toDate) {
        return false;
      }
    }

    return true;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const getStatusClass = (active) => {
    return active
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getVerifiedClass = (verified) => {
    return verified
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ROLE_USER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (active) => {
    return active ? 'Активен' : 'Неактивен';
  };

  const getStatusIcon = (active) => {
    return active ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const closeEditModal = () => {
    setEditModalClosing(true);
    setTimeout(() => {
      setShowEditModal(false);
      setEditModalClosing(false);
    }, 300);
  };

  const closeDeleteModal = () => {
    setDeleteModalClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setDeleteModalClosing(false);
    }, 300);
  };

  const closeCreateModal = () => {
    setCreateModalClosing(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setCreateModalClosing(false);
    }, 300);
  };

  const handleOverlayClick = (e, closeFunction) => {
    if (e.target === e.currentTarget) {
      closeFunction();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Редактирование пользователей" />
      <header className="bg-white shadow-md top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex items-start md:items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3 hidden sm:block">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  Управление пользователями
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Создание, редактирование и управление пользователями системы
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Пользователи
              {filteredUsers.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredUsers.length})
                </span>
              )}
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={refreshData}
                className="inline-flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Обновить
              </button>
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить пользователя
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
                  placeholder="Поиск пользователей..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={filterOptions.searchQuery}
                  onChange={handleFilterChange}
                />
              </div>

              <button
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span>Фильтры</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-500 ease-in-out ${
                    showFilters ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            <div
              className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                showFilters ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
              }`}
            >
              <div className="overflow-hidden min-h-0">
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                      <select
                        name="role"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        value={filterOptions.role}
                        onChange={handleFilterChange}
                      >
                        <option value="ALL">Все роли</option>
                        <option value="ROLE_ADMIN">Администратор</option>
                        <option value="ROLE_USER">Пользователь</option>
                        <option value="ROLE_ANONYMOUS">Анонимный</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                      <select
                        name="status"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        value={filterOptions.status}
                        onChange={handleFilterChange}
                      >
                        <option value="ALL">Все статусы</option>
                        <option value="ACTIVE">Активные</option>
                        <option value="INACTIVE">Неактивные</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Верификация
                      </label>
                      <select
                        name="verified"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        value={filterOptions.verified}
                        onChange={handleFilterChange}
                      >
                        <option value="ALL">Все</option>
                        <option value="VERIFIED">Верифицированные</option>
                        <option value="UNVERIFIED">Неверифицированные</option>
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
          </div>

          {loading && (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Загрузка данных...</p>
              </div>
            </div>
          )}

          {error && (
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
          )}

          <div className="space-y-4 mb-6 lg:hidden">
            {!loading && !error && currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-lg border ${getRoleClass(
                            user.role,
                          )}`}
                        >
                          <span className="text-xs font-medium">
                            {user.role === 'ROLE_ADMIN'
                              ? 'Админ'
                              : user.role === 'ROLE_USER'
                              ? 'Пользователь'
                              : 'Аноним'}
                          </span>
                        </div>
                        <div
                          className={`ml-2 inline-flex items-center px-2 py-1 rounded-lg border ${getStatusClass(
                            user.active,
                          )}`}
                        >
                          {getStatusIcon(user.active)}
                          <span className="ml-1 text-xs font-medium">
                            {getStatusText(user.active)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeAgo(user.createdAt)}
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-800">{user.email}</p>
                      <p className="text-sm text-gray-600">{user.name || '—'}</p>
                    </div>

                    <button
                      onClick={() => toggleUserExpand(user.id)}
                      className={`w-full flex items-center justify-center py-1.5 px-3 mb-3 rounded-md border transition-all duration-300 ${
                        expandedUsers[user.id]
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs font-medium mr-1.5">
                        {expandedUsers[user.id] ? 'Скрыть детали' : 'Показать детали'}
                      </span>
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        <ChevronDown
                          size={14}
                          className={`absolute transition-transform duration-300 ease-in-out ${
                            expandedUsers[user.id]
                              ? 'opacity-0 transform rotate-180'
                              : 'opacity-100'
                          }`}
                        />
                        <ChevronUp
                          size={14}
                          className={`absolute transition-transform duration-300 ease-in-out ${
                            expandedUsers[user.id]
                              ? 'opacity-100'
                              : 'opacity-0 transform -rotate-180'
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        expandedUsers[user.id] ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden min-h-0">
                        <div
                          className={`space-y-3 p-3 rounded-lg bg-gray-50 border border-gray-100 mb-3 transition-opacity duration-300 ${
                            expandedUsers[user.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">ID:</span> {user.id}
                          </div>
                          {user.description && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Описание:</span> {user.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Верифицирован:</span>{' '}
                            {user.verified ? 'Да' : 'Нет'}
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Создан:</span>{' '}
                            {formatDate(user.createdAt)} в {formatTime(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                          onClick={() => handleEditClick(user)}
                          className="text-xs bg-blue-50 text-blue-700 py-1.5 px-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center"
                      >
                        <PenLine className="h-3 w-3 mr-1" />
                        Изменить
                      </button>
                      <button
                          onClick={() => handleDeleteClick(user)}
                          className="text-xs bg-red-50 text-red-700 py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Удалить
                      </button>
                      {user.active ? (
                          <button
                              onClick={() => handleBlockUser(user.id)}
                              className="text-xs bg-yellow-50 text-yellow-700 py-1.5 px-3 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors flex items-center"
                          >
                            <Lock className="h-3 w-3 mr-1" />
                            Блок
                          </button>
                      ) : (
                          <button
                              onClick={() => handleUnblockUser(user.id)}
                              className="text-xs bg-green-50 text-green-700 py-1.5 px-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors flex items-center"
                          >
                            <Unlock className="h-3 w-3 mr-1" />
                            Разблок
                          </button>
                      )}
                      {!user.verified && (
                          <button
                              onClick={() => verifyUser(user.id)}
                              className="text-xs bg-purple-50 text-purple-700 py-1.5 px-3 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors flex items-center"
                          >
                            <CheckCircle className="h-3 w-3 mr-1"/>
                            Вериф
                          </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : !loading && !error && currentUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                  <Users className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователей не найдено</h3>
                <p className="text-gray-500">
                  {filterOptions.searchQuery ||
                  filterOptions.role !== 'ALL' ||
                  filterOptions.status !== 'ALL' ||
                  filterOptions.verified !== 'ALL' ||
                  filterOptions.dateFrom ||
                  filterOptions.dateTo
                    ? 'Попробуйте изменить параметры фильтрации'
                    : 'В системе нет зарегистрированных пользователей'}
                </p>
              </div>
            ) : null}
          </div>

          {!loading && !error && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden hidden lg:block">
              {currentUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          { id: 'user', label: 'Пользователь', width: '250px' },
                          { id: 'description', label: 'Описание', width: '280px' },
                          { id: 'status', label: 'Статус', width: '180px' },
                          { id: 'role', label: 'Роль' },
                          { id: 'createdAt', label: 'Создан' },
                          { id: 'actions', label: 'Действия' },
                        ].map((column) => (
                          <th
                            key={column.id}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                            style={{
                              width: column.width || (column.id === 'actions' ? '120px' : 'auto'),
                            }}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                {user.name
                                  ? user.name.charAt(0).toUpperCase()
                                  : user.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-2 flex flex-col overflow-hidden">
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                  {user.name || 'Без имени'}
                                </div>
                                <div className="text-xs text-gray-700 truncate">{user.email}</div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  ID: {user.id.substring(0, 23)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 relative">
                            {user.description ? (
                              <div>
                                <div
                                  className={`overflow-hidden transition-all duration-300 ease-in-out text-sm text-gray-700 break-words break-all w-full`}
                                  style={{
                                    maxHeight: expandedUsers[`desc_${user.id}`] ? '200px' : '40px',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                  }}
                                >
                                  {user.description}
                                </div>

                                {user.description.length > 50 && (
                                  <button
                                    onClick={() => {
                                      setExpandedUsers((prev) => ({
                                        ...prev,
                                        [`desc_${user.id}`]: !prev[`desc_${user.id}`],
                                      }));
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                                  >
                                    {expandedUsers[`desc_${user.id}`] ? 'Свернуть' : 'Подробнее'}
                                    <div className="relative w-4 h-4 ml-0.5 flex items-center justify-center">
                                      <ChevronDown
                                        className={`absolute transition-transform duration-300 ease-in-out h-3 w-3 ${
                                          expandedUsers[`desc_${user.id}`]
                                            ? 'transform rotate-180'
                                            : ''
                                        }`}
                                      />
                                    </div>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Нет описания</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-col space-y-1">
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-lg border ${getStatusClass(
                                  user.active,
                                )}`}
                              >
                                {getStatusIcon(user.active)}
                                <span className="ml-1 text-xs font-medium">
                                  {getStatusText(user.active)}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-1 text-left rounded-lg text-xs font-medium ${
                                  user.verified
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                }`}
                              >
                                {user.verified ? 'Верифицирован' : 'Не верифицирован'}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleClass(
                                user.role,
                              )}`}
                            >
                              {user.role === 'ROLE_ADMIN'
                                ? 'Администратор'
                                : user.role === 'ROLE_USER'
                                ? 'Пользователь'
                                : 'Анонимный'}
                            </span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatTime(user.createdAt)}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-start gap-1">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="p-1.5 text-blue-600 hover:text-blue-900 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Изменить"
                              >
                                <PenLine className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="p-1.5 text-red-600 hover:text-red-900 rounded-lg hover:bg-red-50 transition-colors"
                                title="Удалить"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {user.active ? (
                                <button
                                  onClick={() => handleBlockUser(user.id)}
                                  className="p-1.5 text-yellow-600 hover:text-yellow-900 rounded-lg hover:bg-yellow-50 transition-colors"
                                  title="Блокировать"
                                >
                                  <Lock className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnblockUser(user.id)}
                                  className="p-1.5 text-green-600 hover:text-green-900 rounded-lg hover:bg-green-50 transition-colors"
                                  title="Разблокировать"
                                >
                                  <Unlock className="h-4 w-4" />
                                </button>
                              )}
                              {!user.verified && (
                                  <button
                                      onClick={() => verifyUser(user.id)}
                                      className="p-1.5 text-purple-600 hover:text-purple-900 rounded-lg hover:bg-purple-50 transition-colors"
                                      title="Верифицировать"
                                  >
                                    <CheckCircle className="h-4 w-4"/>
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
                    <Users className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Пользователей не найдено
                  </h3>
                  <p className="text-gray-500">
                    {filterOptions.searchQuery ||
                    filterOptions.role !== 'ALL' ||
                    filterOptions.status !== 'ALL' ||
                    filterOptions.verified !== 'ALL' ||
                    filterOptions.dateFrom ||
                    filterOptions.dateTo
                      ? 'Попробуйте изменить параметры фильтрации'
                      : 'В системе нет зарегистрированных пользователей'}
                  </p>
                </div>
              )}

              {currentUsers.length > 0 && (
                <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Назад
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage >= totalPages}
                      className={`ml-3 px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        currentPage >= totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Вперед
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Показаны записи с{' '}
                        <span className="font-medium">{indexOfFirstUser + 1}</span> по{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastUser, filteredUsers.length)}
                        </span>{' '}
                        из <span className="font-medium">{filteredUsers.length}</span> записей
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        {/* Кнопка "Назад" */}
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {(() => {
                          if (totalPages <= 4) {
                            return [...Array(totalPages)].map((_, idx) => {
                              const pageNum = idx + 1;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => paginate(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    pageNum === currentPage
                                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            });
                          }

                          let pagesToShow = [];

                          if (currentPage <= 2) {
                            pagesToShow = [1, 2, null, totalPages - 1, totalPages];
                          } else if (currentPage >= totalPages - 1) {
                            pagesToShow = [1, 2, null, totalPages - 1, totalPages];
                          } else if (currentPage === 3) {
                            pagesToShow = [2, 3, null, totalPages - 1, totalPages];
                          } else if (currentPage === totalPages - 2) {
                            pagesToShow = [1, 2, null, totalPages - 2, totalPages - 1];
                          } else {
                            pagesToShow = [
                              currentPage - 1,
                              currentPage,
                              null,
                              totalPages - 1,
                              totalPages,
                            ];
                          }

                          return pagesToShow.map((pageNum, idx) => {
                            if (pageNum === null) {
                              return (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                >
                                  ...
                                </span>
                              );
                            }

                            return (
                              <button
                                key={`page-${pageNum}`}
                                onClick={() => paginate(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === currentPage
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          });
                        })()}

                        {/* Кнопка "Вперёд" */}
                        <button
                          onClick={nextPage}
                          disabled={currentPage >= totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                            currentPage >= totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showEditModal && (
        <div
          className={`fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${
            editModalClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={(e) => handleOverlayClick(e, closeEditModal)}
        >
          <div
            className={`bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 ease-in-out ${
              editModalClosing
                ? 'scale-95 opacity-0'
                : editModalAppearing
                ? 'scale-95 opacity-0'
                : 'scale-100 opacity-100'
            }`}
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Редактирование пользователя</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {updateMessage && (
              <div className="mb-5 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {updateMessage}
              </div>
            )}

            {updateError && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {updateError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="Оставьте пустым, чтобы не менять"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className={`fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${
            deleteModalClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={(e) => handleOverlayClick(e, closeDeleteModal)}
        >
          <div
            className={`bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 ease-in-out ${
              deleteModalClosing
                ? 'scale-95 opacity-0'
                : deleteModalAppearing
                ? 'scale-95 opacity-0'
                : 'scale-100 opacity-100'
            }`}
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Подтверждение удаления</h2>
              <button
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {deleteMessage && (
              <div className="mb-5 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {deleteMessage}
              </div>
            )}

            {deleteError && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {deleteError}
              </div>
            )}

            <div className="py-6 text-center">
              <Trash2 className="h-14 w-14 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-medium">
                Вы уверены, что хотите удалить пользователя?
              </p>
              <p className="text-gray-500 mt-2">
                <span className="font-semibold">{deletingUser?.name || deletingUser?.email}</span>
              </p>
              <p className="text-gray-500 text-sm mt-2">Это действие нельзя будет отменить.</p>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div
          className={`fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${
            createModalClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={(e) => handleOverlayClick(e, closeCreateModal)}
        >
          <div
            className={`bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 ease-in-out ${
              createModalClosing
                ? 'scale-95 opacity-0'
                : createModalAppearing
                ? 'scale-95 opacity-0'
                : 'scale-100 opacity-100'
            }`}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Создание пользователя</h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {createMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {createMessage}
              </div>
            )}

            {createError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={createFormData.email}
                  onChange={handleCreateFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль *</label>
                <input
                  type="password"
                  name="password"
                  value={createFormData.password}
                  onChange={handleCreateFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  name="name"
                  value={createFormData.name}
                  onChange={handleCreateFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                <select
                  name="role"
                  value={createFormData.role}
                  onChange={handleCreateFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ROLE_USER">Пользователь</option>
                  <option value="ROLE_ADMIN">Администратор</option>
                  <option value="ROLE_ANONYMOUS">Анонимный</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserControl;
