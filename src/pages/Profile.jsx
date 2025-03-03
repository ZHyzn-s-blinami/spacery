import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from '../store/user/thunks';
import { addUser } from '../store/user/slice';
import {
    UserIcon, ShieldCheckIcon, LogOutIcon, CalendarIcon,
    Mail, Edit3, Check, X, AlertCircle, Eye, EyeOff,
    Phone, User, Save, Activity, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const dispatch = useDispatch();
    const userToken = localStorage.getItem('userToken');
    const { user, loading, error } = useSelector((state) => state.user);

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({
        loading: false,
        success: false,
        error: null
    });

    // Verification email state
    const [verificationStatus, setVerificationStatus] = useState({
        loading: false,
        success: false,
        error: null
    });

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

        // Initialize form data when user is loaded
        if (user) {
            setEditFormData({
                name: user.name || '',
                description: user.description || '',
                email: user.email || '',
                password: ''
            });
        }
    }, [userToken, user, dispatch]);

    const handleVerification = async () => {
        setVerificationStatus({ loading: true, success: false, error: null });

        try {
            await axios.post('https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/user/verify', {}, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setVerificationStatus({ loading: false, success: true, error: null });

            // Reset success message after 3 seconds
            setTimeout(() => {
                setVerificationStatus(prev => ({ ...prev, success: false }));
            }, 3000);
        } catch (err) {
            setVerificationStatus({
                loading: false,
                success: false,
                error: err.response?.data?.error || 'Ошибка отправки верификационного письма'
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        location.reload();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleEditMode = () => {
        if (isEditMode) {
            // Reset form data when canceling edit
            setEditFormData({
                name: user.name || '',
                description: user.description || '',
                email: user.email || '',
                password: ''
            });
        }
        setIsEditMode(!isEditMode);
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ loading: true, success: false, error: null });

        try {
            // Only send non-empty fields
            const payload = {};
            Object.entries(editFormData).forEach(([key, value]) => {
                if (value.trim() !== '') {
                    payload[key] = value;
                }
            });

            await axios.put(
                `https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/user/edit/${user.id}`,
                payload,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            setSubmitStatus({ loading: false, success: true, error: null });

            // Refresh user data and exit edit mode
            dispatch(fetchUserData());

            setTimeout(() => {
                setIsEditMode(false);
                setSubmitStatus(prev => ({ ...prev, success: false }));
            }, 1500);
        } catch (err) {
            setSubmitStatus({
                loading: false,
                success: false,
                error: err.response?.data?.error || 'Ошибка при обновлении данных'
            });
        }
    };

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
                    <p className="text-red-600">{error.message}</p>
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
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center">
                                <div className="bg-white/20 p-3 rounded-full mr-4">
                                    <UserIcon size={28}/>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{user.name}</h1>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleVerification}
                                    className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg flex items-center transition-all cursor-pointer flex-1 md:flex-none justify-center"
                                    disabled={verificationStatus.loading}
                                >
                                    {verificationStatus.loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-blue-600 rounded-full"></div>
                                            <span>Отправка...</span>
                                        </div>
                                    ) : verificationStatus.success ? (
                                        <div className="flex items-center">
                                            <Check size={18} className="mr-2 text-green-600" />
                                            <span>Отправлено!</span>
                                        </div>
                                    ) : (
                                        <>
                                            <ShieldCheckIcon size={18} className="mr-2"/>
                                            <span>Верификация</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-all cursor-pointer flex-1 md:flex-none justify-center"
                                >
                                    <LogOutIcon size={18} className="mr-2"/>
                                    <span>Выйти</span>
                                </button>
                            </div>
                        </div>

                        {verificationStatus.error && (
                            <div className="mt-4 bg-red-500/20 border border-red-300 rounded-lg p-3 text-sm flex items-start">
                                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                <span>{verificationStatus.error}</span>
                            </div>
                        )}
                    </div>

                    {isEditMode ? (
                        <form onSubmit={handleSubmitEdit} className="p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-xl font-medium text-gray-800">Редактирование профиля</h3>
                                <button
                                    type="button"
                                    onClick={toggleEditMode}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {submitStatus.error && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                    <div className="flex">
                                        <AlertCircle className="text-red-500 mr-2" size={20} />
                                        <p className="text-red-700">{submitStatus.error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                                        Имя
                                    </label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={editFormData.name}
                                            onChange={handleInputChange}
                                            placeholder="Введите ваше имя"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={editFormData.email}
                                            onChange={handleInputChange}
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                                        Пароль (оставьте пустым, если не хотите менять)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            className="pl-10 pr-12 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={editFormData.password}
                                            onChange={handleInputChange}
                                            placeholder="Новый пароль"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                                        О себе
                                    </label>
                                    <div className="relative">
                                        <Edit3 size={18} className="absolute left-3 top-3 text-gray-400" />
                                        <textarea
                                            id="description"
                                            name="description"
                                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={editFormData.description}
                                            onChange={handleInputChange}
                                            placeholder="Расскажите о себе"
                                            rows="3"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={submitStatus.loading}
                                >
                                    {submitStatus.loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                                            <span>Сохранение...</span>
                                        </div>
                                    ) : submitStatus.success ? (
                                        <div className="flex items-center">
                                            <Check size={18} className="mr-2" />
                                            <span>Сохранено!</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            <span>Сохранить изменения</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-medium text-gray-800">Профиль</h3>
                                <button
                                    onClick={toggleEditMode}
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                    <Edit3 size={16} className="mr-1" />
                                    <span>Редактировать</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-3 flex items-center">
                                        <User className="mr-2 text-gray-500" size={20} />
                                        Личная информация
                                    </h3>
                                    <p className="text-gray-600 mb-2">Имя: {user.name || "Не указано"}</p>
                                    <p className="text-gray-600">О себе: {user.description || "Не указано"}</p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-3 flex items-center">
                                        <Mail className="mr-2 text-gray-500" size={20} />
                                        Контактная информация
                                    </h3>
                                    <p className="text-gray-600 mb-2">Email: {user.email || "Не указан"}</p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-3 flex items-center">
                                        <Activity className="mr-2 text-gray-500" size={20} />
                                        Настройки аккаунта
                                    </h3>
                                    <p className="text-gray-600">Статус: Активен</p>
                                    <p className="text-gray-600">Верифицирован: {user.verified ? "Да" : "Нет"}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to="/meetings"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-all w-full"
                                >
                                    <CalendarIcon size={18} className="mr-2" />
                                    Просмотреть мои встречи
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;