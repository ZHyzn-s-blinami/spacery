import React, { useEffect, useRef, useState } from "react";
import { Coffee, Info, Lock, Users, Wifi } from "lucide-react";

const SeatPopover = ({
                         seat,
                         timeRange,
                         selectedDate,
                         onClose,
                         onBook,
                         containerRef,
                         isWorkingHours = true
                     }) => {
    const popoverRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookingStatus, setBookingStatus] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
        }, 10);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target) &&
                !e.target.closest(`[data-seat-id="${seat.id}"]`)
            ) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [seat.id]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleBookClick = async () => {
        if (!isWorkingHours) return;

        setLoading(true);
        setBookingStatus(null);
        try {
            await onBook();
            setBookingStatus('success');
            setTimeout(() => {
                handleClose();
            }, 1000);
        } catch (error) {
            setBookingStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const getSeatTypeInfo = (seatId) => {
        const zoneId = seatId.charAt(0);

        switch (zoneId) {
            case 'A':
                return {
                    icon: <Users className="w-4 h-4 text-blue-600" />,
                    name: 'Место в опен-спейсе',
                    description: 'Общая рабочая зона',
                };
            case 'B':
                return {
                    icon: <Lock className="w-4 h-4 text-teal-600" />,
                    name: 'Кабинет',
                    description: 'Индивидуальный офис',
                };
            case 'C':
                return {
                    icon: <Users className="w-4 h-4 text-yellow-600" />,
                    name: 'Переговорная',
                    description: 'Комната для встреч',
                };
            case 'D':
                return {
                    icon: <Info className="w-4 h-4 text-purple-600" />,
                    name: 'Место в тихой зоне',
                    description: 'Зона для сосредоточенной работы',
                };
            case 'E':
                return {
                    icon: <Coffee className="w-4 h-4 text-green-600" />,
                    name: 'Место в зоне отдыха',
                    description: 'Комфортная зона для отдыха',
                };
            default:
                return {
                    icon: <Users className="w-4 h-4 text-gray-600" />,
                    name: 'Рабочее место',
                    description: 'Стандартное рабочее место',
                };
        }
    };

    const formatTime = (time) => {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const seatInfo = getSeatTypeInfo(seat.name);

    return (
        <div
            className="absolute inset-0 flex items-center justify-center z-50 transition-all duration-300 ease-in-out"
            style={{
                backdropFilter: mounted && !isClosing ? 'blur(5px)' : 'blur(0px)',
                backgroundColor: mounted && !isClosing ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)',
            }}
        >
            <div
                ref={popoverRef}
                className={`relative w-72 bg-white border border-gray-200 rounded-lg shadow-xl transition-all duration-300 ${
                    isClosing ? 'opacity-0 transform scale-95' : mounted ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'
                }`}
            >
                <div className="absolute top-3 right-3">
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full p-1 hover:bg-gray-100 focus:outline-none"
                        aria-label="Закрыть"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Место {seat.name}</h3>
                    <p className="text-sm text-gray-500">{seatInfo.description}</p>
                </div>

                <div className="px-4 py-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Coffee className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">Есть доступ к кофе-зоне</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Wifi className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">Wi-Fi 100 Мбит/с</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">
                                До {seat.name.startsWith('B') || seat.name.startsWith('C') ? '4' : '1'} человека
                            </span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                            <div className="flex justify-between text-sm text-gray-700">
                                <span>Время:</span>
                                <span className="font-medium">
                                    {formatTime(timeRange.start)} - {formatTime(timeRange.end)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1 text-gray-700">
                                <span>Дата:</span>
                                <span className="font-medium">{formatDate(selectedDate)}</span>
                            </div>
                        </div>

                        {!isWorkingHours ? (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-center">
                                <p className="text-sm text-yellow-700 font-medium">
                                    Коворкинг закрыт. <br/> Бронирование в данный момент недоступно.
                                </p>
                            </div>
                        ) : (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleBookClick}
                                    disabled={loading}
                                    className={`flex-1 px-3 py-2 text-xs font-medium text-center transition-all duration-300 ease-in-out ${
                                        loading
                                            ? 'bg-blue-400 cursor-wait'
                                            : bookingStatus === 'success'
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : bookingStatus === 'error'
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300`}
                                >
                                    <div className="relative flex items-center justify-center w-full h-full">
                                        <span className={`transition-all duration-300 ease-in-out ${
                                            loading || bookingStatus !== null ? 'opacity-0' : 'opacity-100'
                                        }`}>
                                            Забронировать
                                        </span>

                                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                                            loading ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                        }`}>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Загрузка</span>
                                        </div>

                                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                                            !loading && bookingStatus === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                        }`}>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <span>Забронировано</span>
                                        </div>

                                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
                                            !loading && bookingStatus === 'error' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                        }`}>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            <span>Ошибка</span>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-3 py-2 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200"
                                >
                                    Отмена
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatPopover;