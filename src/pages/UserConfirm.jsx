import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {toast} from 'react-hot-toast';
import axios from 'axios';

const UserConfirm = () => {
    const {jwt} = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState({loading: true, error: null, success: false});

    // Create API client
    const apiClient = axios.create({
        baseURL: 'https://prod-team-5-qnkvbg7c.final.prodcontest.ru',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        const confirmUser = async () => {
            try {
                setStatus({loading: true, error: null, success: false});

                const token = localStorage.getItem('userToken');
                const response = await apiClient.get(`/api/user/confirm?token=${jwt}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    validateStatus: function (status) {
                        // Accept all status codes to handle them manually
                        return true;
                    }
                });

                console.log(response.data);

                // Check for 302/304 status codes for successful confirmation
                if (response.status === 302 || response.status === 304) {
                    setStatus({loading: false, error: null, success: true});
                    toast.success('Аккаунт успешно подтвержден!');

                    setTimeout(() => {
                        navigate('/profile');
                    }, 5000);
                } else {
                    setStatus({
                        loading: false,
                        error: response.data?.error || 'Неожиданный ответ сервера',
                        success: false
                    });
                    toast.error('Ошибка при подтверждении аккаунта');
                }
            } catch (error) {
                console.error('Confirmation error:', error);
                setStatus({
                    loading: false,
                    error: error.response?.data?.error || 'Ошибка при подтверждении аккаунта',
                    success: false
                });
                toast.error(error.response?.data?.error || 'Ошибка при подтверждении аккаунта');
            }
        };

        confirmUser();
    }, [jwt, navigate]);

    // Rest of the component remains unchanged
    return (
        // Your existing JSX code here
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            {/* Existing UI code */}
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-semibold text-center mb-6">Подтверждение аккаунта</h2>

                {status.loading ? (
                    <div className="flex flex-col items-center justify-center">
                        <div
                            className="animate-spin h-12 w-12 mb-4 border-4 border-t-transparent border-blue-600 rounded-full"></div>
                        <p className="text-gray-600">Подтверждаем ваш аккаунт...</p>
                    </div>
                ) : status.error ? (
                    <div className="text-center text-red-600">
                        <p>{status.error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            На главную
                        </button>
                    </div>
                ) : status.success ? (
                    <div className="text-center text-green-600">
                        <p>Аккаунт успешно подтвержден!</p>
                        <p className="text-sm text-gray-500 mt-2">Перенаправление на страницу профиля через 5
                            секунд...</p>
                        <button
                            onClick={() => navigate('/profile')}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Перейти в профиль
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default UserConfirm;