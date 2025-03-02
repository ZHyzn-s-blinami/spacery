import React, { useEffect, useRef, useState } from "react";
import {Coffee, Info, Lock, Users, Wifi} from "lucide-react";

const SeatPopover = ({ seat, timeRange, selectedDate, onClose, onBook, position }) => {
    const popoverRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleClickOutside = (e) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target) &&
                !e.target.closest(`[data-seat-id="${seat.id}"]`)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [seat.id, onClose]);

    useEffect(() => {
        if (mounted && popoverRef.current) {
            const popover = popoverRef.current;
            const rect = popover.getBoundingClientRect();

            if (rect.top < 10) {
                popover.style.top = `${position.y + 20}px`;
                popover.style.transform = 'translate(-50%, 0)';

                const arrow = popover.querySelector('[data-arrow]');
                if (arrow) {
                    arrow.style.bottom = 'auto';
                    arrow.style.top = '-7px';
                    arrow.style.transform = 'rotate(225deg)';
                }
            }
        }
    }, [mounted, position.y]);

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
            ref={popoverRef}
            className={`fixed z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 ${
                mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
                left: `${position.x}px`,
                top: `${position.y - 10}px`,
                transform: 'translate(-50%, -100%)',
            }}
        >
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
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={onBook}
                            className="flex-1 px-3 py-2 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
                        >
                            Забронировать
                        </button>
                        <button
                            onClick={onClose}
                            className="px-3 py-2 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SeatPopover;
