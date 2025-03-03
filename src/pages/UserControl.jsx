import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toastManager } from '../common/toastManager';

const UserControl = () => {
  // State for storing user data, loading state, and errors
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for edit modal
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

  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // State for create user modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'ROLE_USER',
  });
  const [createMessage, setCreateMessage] = useState(null);
  const [createError, setCreateError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Column resize state
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

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle mouse move for column resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingColumn) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px

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

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        'https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/user/all',
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

  // Format date to be more readable
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Open edit modal for a specific user
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
  };

  // Open delete modal for a specific user
  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setDeleteMessage(null);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  // Open create user modal
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
  };

  // Handle edit form field changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle create form field changes
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({
      ...createFormData,
      [name]: value,
    });
  };

  // Submit user edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Remove empty fields from the payload
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
        `https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/user/edit/${editingUser.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setUpdateMessage('Пользователь успешно обновлен');

      // Refresh the user list after updating
      fetchUsers();

      // Close modal after 1 second
      setTimeout(() => {
        setShowEditModal(false);
      }, 1000);
    } catch (err) {
      setUpdateError(
        err.response?.data?.message || err.message || 'Ошибка при обновлении пользователя',
      );
    }
  };

  // Submit create user form
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      setCreateError(null);
      setCreateMessage(null);

      // Check if required fields are filled
      if (!createFormData.email || !createFormData.password) {
        setCreateError('Email и пароль обязательны');
        return;
      }

      const token = localStorage.getItem('userToken');
      await axios.post(
        'https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/user/sign-up',
        createFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setCreateMessage('Пользователь успешно создан');

      // Refresh the user list after creating
      fetchUsers();

      // Close modal after 1 second
      setTimeout(() => {
        setShowCreateModal(false);
      }, 1000);
    } catch (err) {
      setCreateError(
        err.response?.data?.message || err.message || 'Ошибка при создании пользователя',
      );
    }
  };

  // Delete user confirmation
  const handleDeleteSubmit = async () => {
    try {
      setDeleteError(null);
      setDeleteMessage(null);

      const token = localStorage.getItem('userToken');
      await axios.delete(
        `https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/user/delete/${deletingUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setDeleteMessage('Пользователь успешно удален');

      // Refresh the user list after deleting
      fetchUsers();

      // Close modal after 1 second
      setTimeout(() => {
        setShowDeleteModal(false);
      }, 1000);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || err.message || 'Ошибка при удалении пользователя',
      );
    }
  };

  // Start column resize
  const handleResizeStart = (columnName, e) => {
    setResizingColumn(columnName);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnName]);
  };

  // Pagination calculation
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Add these handler functions after the existing handlers
  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(
        `https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/user/block/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      toastManager.showSuccessToast('Пользователь заблокирован');
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Error blocking user:', err);
      toastManager.showErrorToast('Не удалось заблокировать пользователя');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.post(
        `https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/user/unblock/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      toastManager.showSuccessToast('Пользователь разблокирован');
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Error unblocking user:', err);
      toastManager.showErrorToast('Не удалось разблокировать пользователя');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Управление пользователями
          </h1>

          {/* Action buttons */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={handleCreateClick}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Добавить пользователя
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center my-8">
              <div className="text-gray-600 flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Загрузка данных пользователей...
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mx-auto max-w-3xl my-6">
              <div className="text-red-600 p-4 bg-red-50 rounded-lg shadow-sm border border-red-100 text-center">
                <p className="font-medium">Ошибка: {error}</p>
              </div>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="mt-6 overflow-hidden border border-gray-200 rounded-xl shadow-sm">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table ref={tableRef} className="min-w-full bg-white table-auto">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50 sticky top-0 z-10">
                    <tr>
                      {[
                        { id: 'id', label: 'ID' },
                        { id: 'email', label: 'Email' },
                        { id: 'name', label: 'Name' },
                        { id: 'active', label: 'Active' },
                        { id: 'description', label: 'Description' },
                        { id: 'verified', label: 'Verified' },
                        { id: 'createdAt', label: 'CreatedAt' },
                        { id: 'role', label: 'Role' },
                        { id: 'actions', label: 'Действия' },
                      ].map((column) => (
                        <th
                          key={column.id}
                          className="py-3.5 px-3 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider relative"
                          style={{ width: `${columnWidths[column.id]}px` }}
                        >
                          {column.label}
                          <div
                            className="absolute right-0 top-0 h-full w-4 cursor-col-resize flex items-center justify-center group"
                            onMouseDown={(e) => handleResizeStart(column.id, e)}
                          >
                            <div className="w-0.5 h-4/5 bg-gray-300 group-hover:bg-indigo-500"></div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                          {user.id.substring(0, 8)}...
                        </td>
                        <td className="py-3 px-3 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                          {user.email}
                        </td>
                        <td className="py-3 px-3 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                          {user.name || '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm max-w-[150px] truncate">
                          {user.description || '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.verified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {user.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm whitespace-nowrap">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs transition-colors shadow-sm hover:shadow whitespace-nowrap"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs transition-colors shadow-sm hover:shadow whitespace-nowrap"
                            >
                              Удалить
                            </button>
                            {user.active ? (
                              <button
                                onClick={() => handleBlockUser(user.id)}
                                className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs transition-colors shadow-sm hover:shadow whitespace-nowrap"
                              >
                                Блок
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs transition-colors shadow-sm hover:shadow whitespace-nowrap"
                              >
                                Разблок
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
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
                      Показаны записи с <span className="font-medium">{indexOfFirstUser + 1}</span>{' '}
                      по{' '}
                      <span className="font-medium">{Math.min(indexOfLastUser, users.length)}</span>{' '}
                      из <span className="font-medium">{users.length}</span> записей
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
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

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrentPage = pageNum === currentPage;

                        // Show limited page numbers for better UX
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => paginate(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                isCurrentPage
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          (pageNum === currentPage - 2 && currentPage > 3) ||
                          (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <span
                              key={pageNum}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

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
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg my-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-gray-500 text-lg">Нет доступных пользователей.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-transform duration-300 ease-in-out"
            style={{ animation: 'modal-appear 0.3s ease-out forwards' }}
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Редактирование пользователя</h2>
              <button
                onClick={() => setShowEditModal(false)}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {updateMessage}
              </div>
            )}

            {updateError && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  placeholder="Оставьте пустым, чтобы не менять"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-transform duration-300 ease-in-out"
            style={{ animation: 'modal-appear 0.3s ease-out forwards' }}
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Подтверждение удаления</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {deleteMessage}
              </div>
            )}

            {deleteError && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {deleteError}
              </div>
            )}

            <div className="py-6 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-red-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
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
                onClick={() => setShowDeleteModal(false)}
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-transform duration-300 ease-in-out"
            style={{ animation: 'modal-appear 0.3s ease-out forwards' }}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Создание пользователя</h2>
              <button
                onClick={() => setShowCreateModal(false)}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {createMessage}
              </div>
            )}

            {createError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                <select
                  name="role"
                  value={createFormData.role}
                  onChange={handleCreateFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ROLE_USER">Пользователь</option>
                  <option value="ROLE_ADMIN">Администратор</option>
                  <option value="ROLE_ANONYMOUS">Анонимный</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
