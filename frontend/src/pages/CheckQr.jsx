import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CheckQr = () => {
  const { jwt } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const checkQrCode = async () => {
      try {
        setLoading(true);
        const userToken = localStorage.getItem('userToken');
        const response = await axios.post(
          `http://127.0.0.1:8080/api/booking/qr/check`,
          { qrCode: jwt },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );

        setBookingData(response.data);
      } catch (err) {
        if (err.response && err.response.status === 400) {
          setError('Токен недействителен. QR-код не распознан или срок его действия истек.');
        } else {
          setError(err.response?.data?.message || 'Ошибка при проверке QR-кода');
        }
      } finally {
        setLoading(false);
      }
    };

    if (jwt) {
      checkQrCode();
    }
  }, [jwt]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Ожидает подтверждения',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳',
        };
      case 'ACCEPTED':
        return {
          label: 'Подтверждено',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✓',
        };
      case 'REJECTED':
        return {
          label: 'Отклонено',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '✗',
        };
      case 'OVERDUE':
        return {
          label: 'Просрочено',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⌛',
        };
      default:
        return {
          label: 'Неизвестный статус',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '?',
        };
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Проверка QR-кода...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ошибка проверки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            QR-код недействителен или срок его действия истек.
          </p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800">Данные о бронировании не найдены</h2>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(bookingData.status);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className={`p-6 ${statusInfo.color} border-b-2`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">{statusInfo.icon}</span>
              {statusInfo.label}
            </h2>
            <span className="text-sm px-3 py-1 rounded-full bg-white/30">
              ID: {bookingData.bookingId}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Информация о бронировании</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Место</p>
                  <p className="font-medium">{bookingData.place?.name}</p>
                  <p className="text-sm text-gray-600">{bookingData.place?.description}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Пользователь</p>
                  <p className="font-medium">{bookingData.user?.name}</p>
                  <p className="text-sm text-gray-600">{bookingData.user?.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Начало</p>
                    <p className="font-medium">{formatDateTime(bookingData.startAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Окончание</p>
                    <p className="font-medium">{formatDateTime(bookingData.endAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Создано: {formatDateTime(bookingData.createdAt)}</p>
              {bookingData.updatedAt && <p>Обновлено: {formatDateTime(bookingData.updatedAt)}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckQr;
