import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { useDispatch } from "react-redux";
import { cancelUserMeeting } from "../../store/user/thunks";
import {
    ClockIcon,
    MapPinIcon,
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    AlertCircleIcon,
    XIcon,
    RefreshCwIcon
} from "lucide-react";

const MeetingItem = ({ item }) => {
    if (!item || !item.startAt || !item.endAt) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-gray-500">Информация о встрече недоступна</p>
            </div>
        );
    }

    const dispatch = useDispatch();
    const [showDetails, setShowDetails] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isRescheduleModalClosing, setIsRescheduleModalClosing] = useState(false);
    const [isCancelModalClosing, setIsCancelModalClosing] = useState(false);
    const [rescheduleModalMounted, setRescheduleModalMounted] = useState(false);
    const [cancelModalMounted, setCancelModalMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date(item.startAt).toISOString().split('T')[0]);
    const [selectedStartTime, setSelectedStartTime] = useState(
        `${new Date(item.startAt).getHours().toString().padStart(2, '0')}:${new Date(item.startAt).getMinutes().toString().padStart(2, '0')}`
    );
    const [selectedEndTime, setSelectedEndTime] = useState(
        `${new Date(item.endAt).getHours().toString().padStart(2, '0')}:${new Date(item.endAt).getMinutes().toString().padStart(2, '0')}`
    );
    const [selectedDuration, setSelectedDuration] = useState(
        Math.round((new Date(item.endAt) - new Date(item.startAt)) / (1000 * 60))
    );
    const [rescheduleStatus, setRescheduleStatus] = useState(null);
    const [reschedulingLoading, setReschedulingLoading] = useState(false);

    const startTime = new Date(item.startAt);
    const endTime = new Date(item.endAt);

    useEffect(() => {
        if (showRescheduleModal && !isRescheduleModalClosing) {
            const timer = setTimeout(() => {
                setRescheduleModalMounted(true);
            }, 10);
            return () => clearTimeout(timer);
        }
        if (!showRescheduleModal) {
            setRescheduleModalMounted(false);
        }
    }, [showRescheduleModal, isRescheduleModalClosing]);

    useEffect(() => {
        if (showCancelModal && !isCancelModalClosing) {
            const timer = setTimeout(() => {
                setCancelModalMounted(true);
            }, 10);
            return () => clearTimeout(timer);
        }
        if (!showCancelModal) {
            setCancelModalMounted(false);
        }
    }, [showCancelModal, isCancelModalClosing]);

    const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const getTimeUntilMeeting = () => {
        const now = new Date();
        const diff = startTime - now;

        if (diff <= 0) return "Сейчас";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `через ${days} ${getDayText(days)}`;
        if (hours > 0) return `через ${hours} ${getHourText(hours)}`;
        return `через ${minutes} ${getMinuteText(minutes)}`;
    };

    const getDayText = (days) => {
        if (days === 1) return "день";
        if (days >= 2 && days <= 4) return "дня";
        return "дней";
    };

    const getHourText = (hours) => {
        if (hours === 1) return "час";
        if (hours >= 2 && hours <= 4) return "часа";
        return "часов";
    };

    const getMinuteText = (minutes) => {
        if (minutes === 1) return "минуту";
        if (minutes >= 2 && minutes <= 4) return "минуты";
        return "минут";
    };

    const handleRemove = () => {
        setShowCancelModal(true);
        setIsCancelModalClosing(false);
    };

    const closeCancelModal = () => {
        setIsCancelModalClosing(true);
        setTimeout(() => {
            setShowCancelModal(false);
            setIsCancelModalClosing(false);
        }, 300);
    };

    const confirmCancellation = async () => {
        try {
            dispatch(cancelUserMeeting(item.bookingId));
            closeCancelModal();
        } catch (error) {
            console.error("Ошибка при удалении брони:", error);
        }
    };

    const handleReschedule = () => {
        setShowRescheduleModal(true);
        setIsRescheduleModalClosing(false);
    };

    const closeRescheduleModal = () => {
        setIsRescheduleModalClosing(true);
        setTimeout(() => {
            setShowRescheduleModal(false);
            setIsRescheduleModalClosing(false);
        }, 300);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleStartTimeChange = (e) => {
        setSelectedStartTime(e.target.value);

        const [hours, minutes] = e.target.value.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0);

        const endDate = new Date(startDate.getTime() + selectedDuration * 60 * 1000);
        setSelectedEndTime(
            `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
        );
    };

    const handleEndTimeChange = (e) => {
        setSelectedEndTime(e.target.value);
    };

    const handleDurationChange = (e) => {
        const newDuration = parseInt(e.target.value, 10);
        setSelectedDuration(newDuration);

        const [hours, minutes] = selectedStartTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0);

        const endDate = new Date(startDate.getTime() + newDuration * 60 * 1000);
        setSelectedEndTime(
            `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
        );
    };

    const confirmReschedule = async () => {
        setReschedulingLoading(true);
        setRescheduleStatus(null);

        try {
            const [startHours, startMinutes] = selectedStartTime.split(':').map(Number);
            const [endHours, endMinutes] = selectedEndTime.split(':').map(Number);

            const newStartDate = new Date(selectedDate);
            newStartDate.setHours(startHours, startMinutes, 0);

            const newEndDate = new Date(selectedDate);
            newEndDate.setHours(endHours, endMinutes, 0);


            await new Promise(resolve => setTimeout(resolve, 1000));

            setRescheduleStatus('success');

            setTimeout(() => {
                closeRescheduleModal();
            }, 1000);
        } catch (error) {
            console.error("Ошибка при изменении времени встречи:", error);
            setRescheduleStatus('error');
        } finally {
            setReschedulingLoading(false);
        }
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const getStatusBadge = () => {
        switch (item.status) {
            case "CANCELLED":
                return (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-red-100 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-red-600">Отменено</span>
                    </div>
                );
            case "COMPLETED":
                return (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-blue-600">Завершено</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-green-600">Ожидается</span>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-1 text-lg">{item.address}</h4>
                        <div className="flex items-center text-gray-600 mb-2">
                            <ClockIcon size={16} className="mr-2 text-gray-400" />
                            <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                        </div>
                        {getStatusBadge()}
                    </div>
                    <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        {getTimeUntilMeeting()}
                    </div>
                </div>

                <button
                    onClick={toggleDetails}
                    className="w-full flex items-center justify-center text-blue-600 hover:text-blue-800 text-sm py-2 mt-2 border-t border-gray-100 transition-all duration-200 hover:bg-blue-50"
                >
                    <div className="flex items-center transition-transform duration-300 ease-in-out transform"
                         style={{ transform: showDetails ? 'translateY(0)' : 'translateY(0)' }}
                    >
                        {showDetails ? (
                            <>
                                <ChevronUpIcon size={16} className="mr-1 transition-transform duration-300 transform" />
                                <span className="transition-all duration-200">Скрыть детали</span>
                            </>
                        ) : (
                            <>
                                <ChevronDownIcon size={16} className="mr-1 transition-transform duration-300 transform" />
                                <span className="transition-all duration-200">Показать детали</span>
                            </>
                        )}
                    </div>
                </button>
            </div>

            <div
                className={`bg-gray-50 border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${
                    showDetails ? 'max-h-[2000px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
                }`}
            >
                <div className={`bg-white p-4 rounded-lg shadow-sm mb-4 transition-all duration-300 ease-in-out 
                    ${showDetails ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}
                     style={{
                         transitionDelay: showDetails ? '0.05s' : '0s'
                     }}
                >
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                        <CalendarIcon size={16} className="mr-2 text-blue-600" />
                        Информация о встрече
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-gray-500 mb-1">Дата:</div>
                            <div className="font-medium">
                                {startTime.toLocaleDateString('ru-RU', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Время:</div>
                            <div className="font-medium">{formatTime(startTime)} - {formatTime(endTime)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Место:</div>
                            <div className="font-medium">{item.address}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Статус:</div>
                            <div>{getStatusBadge()}</div>
                        </div>
                        {item.notes && (
                            <div className="col-span-2">
                                <div className="text-gray-500 mb-1">Заметки:</div>
                                <div className="font-medium bg-gray-50 p-2 rounded">{item.notes}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-center transition-all duration-300 ease-in-out 
                    ${showDetails ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}
                     style={{
                         transitionDelay: showDetails ? '0.1s' : '0s'
                     }}
                >
                    <div className="text-center">
                        <div className="mb-3">
                            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                                QR-код для входа
                            </span>
                        </div>
                        <div className="bg-white inline-block p-3 rounded-md border-2 border-dotted border-gray-200">
                            <QRCode value={item.bookingId} size={120} />
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Покажите этот код при входе
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col sm:flex-row gap-2 transition-all duration-300 ease-in-out
                    ${showDetails ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}
                     style={{
                         transitionDelay: showDetails ? '0.15s' : '0s'
                     }}
                >
                    <button
                        onClick={handleReschedule}
                        className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                    >
                        <RefreshCwIcon size={16} className="mr-2 transition-transform duration-300 hover:rotate-180" />
                        Перенести
                    </button>
                    <button
                        onClick={handleRemove}
                        className="flex-1 bg-white border border-red-600 text-red-600 hover:bg-red-50 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                    >
                        <XIcon size={16} className="mr-2 transition-transform duration-300 hover:rotate-90" />
                        Отменить
                    </button>
                </div>
            </div>

            {showRescheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out">
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-in-out"
                        style={{
                            backdropFilter: rescheduleModalMounted && !isRescheduleModalClosing ? 'blur(5px)' : 'blur(0px)',
                            backgroundColor: rescheduleModalMounted && !isRescheduleModalClosing ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)',
                        }}
                        onClick={closeRescheduleModal}
                    ></div>
                    <div
                        className={`relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto z-50 transition-all duration-300 ${
                            isRescheduleModalClosing
                                ? 'opacity-0 transform scale-95'
                                : rescheduleModalMounted
                                    ? 'opacity-100 transform scale-100'
                                    : 'opacity-0 transform scale-95'
                        }`}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium">Изменить время встречи</h3>
                            <button
                                onClick={closeRescheduleModal}
                                className="rounded-full p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <XIcon size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
                                    <div className="flex">
                                        <AlertCircleIcon size={20} className="text-blue-500 mr-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-blue-700">
                                                Выберите новую дату и время для вашей брони
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Время начала</label>
                                            <input
                                                type="time"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={selectedStartTime}
                                                onChange={handleStartTimeChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Время окончания</label>
                                            <input
                                                type="time"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={selectedEndTime}
                                                onChange={handleEndTimeChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Продолжительность</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={selectedDuration}
                                            onChange={handleDurationChange}
                                        >
                                            <option value="30">30 минут</option>
                                            <option value="60">1 час</option>
                                            <option value="90">1 час 30 минут</option>
                                            <option value="120">2 часа</option>
                                            <option value="180">3 часа</option>
                                            <option value="240">4 часа</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                    <div className="flex items-start">
                                        <AlertCircleIcon size={18} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-yellow-700">
                                            Место встречи останется прежним: <span className="font-medium">{item.address}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    onClick={closeRescheduleModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                                    disabled={reschedulingLoading}
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={confirmReschedule}
                                    disabled={reschedulingLoading}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 relative ${
                                        rescheduleStatus === 'success'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : rescheduleStatus === 'error'
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <span className={`transition-all duration-300 ${
                                            reschedulingLoading || rescheduleStatus ? 'opacity-0' : 'opacity-100'
                                        }`}>
                                            Подтвердить
                                        </span>

                                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                                            reschedulingLoading ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Обработка...</span>
                                        </div>

                                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                                            !reschedulingLoading && rescheduleStatus === 'success' ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <span>Успешно</span>
                                        </div>

                                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                                            !reschedulingLoading && rescheduleStatus === 'error' ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            <span>Ошибка</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out">
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-in-out"
                        style={{
                            backdropFilter: cancelModalMounted && !isCancelModalClosing ? 'blur(5px)' : 'blur(0px)',
                            backgroundColor: cancelModalMounted && !isCancelModalClosing ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)',
                        }}
                        onClick={closeCancelModal}
                    ></div>
                    <div
                        className={`relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-50 transition-all duration-300 ${
                            isCancelModalClosing
                                ? 'opacity-0 transform scale-95'
                                : cancelModalMounted
                                    ? 'opacity-100 transform scale-100'
                                    : 'opacity-0 transform scale-95'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-800 flex items-center">
                                <AlertCircleIcon size={20} className="mr-2 text-gray-700" />
                                Подтверждение отмены
                            </h3>
                            <button
                                onClick={closeCancelModal}
                                className="rounded-full p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <XIcon size={20} />
                            </button>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <p className="text-lg mb-2 text-center font-medium text-gray-700">
                                Вы уверены, что хотите отменить бронь?
                            </p>
                            <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex">
                                    <MapPinIcon size={16} className="mr-2 flex-shrink-0 text-gray-500" />
                                    <span>{item.address}</span>
                                </div>
                                <div className="flex">
                                    <CalendarIcon size={16} className="mr-2 flex-shrink-0 text-gray-500" />
                                    <span>{startTime.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}</span>
                                </div>
                                <div className="flex">
                                    <ClockIcon size={16} className="mr-2 flex-shrink-0 text-gray-500" />
                                    <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between space-x-4">
                            <button
                                onClick={closeCancelModal}
                                className="flex-1 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Нет, оставить
                            </button>
                            <button
                                onClick={confirmCancellation}
                                className="flex-1 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Да, отменить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingItem;