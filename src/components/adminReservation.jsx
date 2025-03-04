import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Lock, Info, Coffee, Wifi, Users, MapPin, Filter } from 'lucide-react';
import { placeService } from '../services/placeService';
import { useNavigate } from 'react-router-dom';
import { toastManager } from '../common/toastManager';

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

const CoworkingMap = ({ selectedSeat, onSeatSelect, freePlaces }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);
  const [seats, setSeats] = useState([]);
  const navigate = useNavigate();

  const generateSeats = () => {
    const rooms = [
      ...Array(30)
        .fill()
        .map((_, idx) => ({
          id: `A${idx + 1}`,
          name: `A${idx + 1}`,
          x: 53 + (idx % 6) * 25,
          y: 60 + Math.floor(idx / 6) * 25,
          isOccupied: false,
          zone: 'A',
          type: 'desk',
        })),
      ...Array(9)
        .fill()
        .map((_, idx) => ({
          id: `B${idx + 1}`,
          name: `B${idx + 1}`,
          x: 295 + (idx % 3) * 35,
          y: 65 + Math.floor(idx / 3) * 40,
          isOccupied: false,
          zone: 'B',
          type: 'office',
        })),
      ...Array(8)
        .fill()
        .map((_, idx) => ({
          id: `C${idx + 1}`,
          name: `C${idx + 1}`,
          x: 55 + (idx % 4) * 40,
          y: 280 + Math.floor(idx / 4) * 45,
          isOccupied: false,
          zone: 'C',
          type: 'meeting',
        })),
      ...Array(12)
        .fill()
        .map((_, idx) => ({
          id: `D${idx + 1}`,
          name: `D${idx + 1}`,
          x: 270 + (idx % 6) * 30,
          y: 270 + Math.floor(idx / 6) * 35,
          isOccupied: false,
          zone: 'D',
          type: 'focus',
        })),
      ...Array(6)
        .fill()
        .map((_, idx) => ({
          id: `E${idx + 1}`,
          name: `E${idx + 1}`,
          x: 490 + (idx % 3) * 30,
          y: 80 + Math.floor(idx / 3) * 40,
          isOccupied: false,
          zone: 'E',
          type: 'lounge',
        })),
    ];
    return rooms;
  };

  useEffect(() => {
    setSeats(generateSeats());
  }, [freePlaces]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(0.5, Math.min(2, prev + delta)));
  };

  const handleMouseDown = (e) => {
    let target = e.target;
    while (target && target !== mapRef.current) {
      if (target.getAttribute('data-seat') === 'true') {
        return;
      }
      target = target.parentElement;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const currentMapRef = mapRef.current;
    if (currentMapRef) {
      currentMapRef.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (currentMapRef) {
        currentMapRef.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-50 rounded-xl h-[500px] border border-gray-200"
      ref={mapRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="absolute top-3 left-3 bg-white p-2 rounded-md shadow-sm z-20 flex gap-2">
        <button
          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
          onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
        >
          +
        </button>
        <button
          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
          onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
        >
          -
        </button>
        <button
          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center"
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
        >
          ↺
        </button>
      </div>

      <div
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.2s',
        }}
        className="absolute inset-0"
      >
        <svg width="600" height="400" viewBox="0 0 600 400" className="mx-auto">
          <rect
            x="10"
            y="10"
            width="580"
            height="380"
            rx="5"
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth="2"
          />

          <rect x="20" y="20" width="580" height="380" rx="5" fill="#f8fafc" stroke="none" />

          <rect
            x="215"
            y="20"
            width="10"
            height="360"
            fill="#e5e7eb"
            stroke="#d1d5db"
            strokeWidth="1"
          />
          <line x1="215" y1="20" x2="215" y2="380" stroke="#d1d5db" strokeWidth="1.5" />
          <line x1="225" y1="20" x2="225" y2="380" stroke="#d1d5db" strokeWidth="1.5" />

          <rect
            x="435"
            y="20"
            width="10"
            height="360"
            fill="#e5e7eb"
            stroke="#d1d5db"
            strokeWidth="1"
          />
          <line x1="435" y1="20" x2="435" y2="380" stroke="#d1d5db" strokeWidth="1.5" />
          <line x1="445" y1="20" x2="445" y2="380" stroke="#d1d5db" strokeWidth="1.5" />

          <rect
            x="20"
            y="205"
            width="570"
            height="10"
            fill="#e5e7eb"
            stroke="#d1d5db"
            strokeWidth="1"
          />
          <line x1="20" y1="205" x2="590" y2="205" stroke="#d1d5db" strokeWidth="1.5" />
          <line x1="20" y1="215" x2="590" y2="215" stroke="#d1d5db" strokeWidth="1.5" />

          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`vl-left-${i}`}
              x1="220"
              y1={40 + i * 36}
              x2="220"
              y2={40 + i * 36 + 20}
              stroke="#d1d5db"
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`vl-right-${i}`}
              x1="440"
              y1={40 + i * 36}
              x2="440"
              y2={40 + i * 36 + 20}
              stroke="#d1d5db"
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
          ))}

          {Array.from({ length: 19 }).map((_, i) => (
            <line
              key={`hl-${i}`}
              x1={35 + i * 30}
              y1="210"
              x2={35 + i * 30 + 15}
              y2="210"
              stroke="#d1d5db"
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
          ))}

          <rect
            x="20"
            y="20"
            width="190"
            height="180"
            rx="3"
            fill="#eff6ff"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="5,3"
          />
          <text x="30" y="40" fill="#1e40af" fontSize="12" fontWeight="bold">
            Зона A: Опен-спейс
          </text>

          <rect
            x="230"
            y="20"
            width="200"
            height="180"
            rx="3"
            fill="#f0fdfa"
            stroke="#14b8a6"
            strokeWidth="1"
          />
          <text x="240" y="40" fill="#0f766e" fontSize="12" fontWeight="bold">
            Зона B: Кабинеты
          </text>

          <rect
            x="260"
            y="50"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />
          <rect
            x="310"
            y="50"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />
          <rect
            x="360"
            y="50"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />
          <rect
            x="260"
            y="100"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />
          <rect
            x="310"
            y="100"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />
          <rect
            x="360"
            y="100"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />
          <rect
            x="260"
            y="150"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />
          <rect
            x="310"
            y="150"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />
          <rect
            x="360"
            y="150"
            width="40"
            height="30"
            rx="2"
            fill="none"
            stroke="#0f766e"
            strokeWidth="1"
          />

          <rect
            x="20"
            y="220"
            width="190"
            height="160"
            rx="3"
            fill="#fef9c3"
            stroke="#ca8a04"
            strokeWidth="1"
          />
          <text x="30" y="240" fill="#854d0e" fontSize="12" fontWeight="bold">
            Зона C: Переговорные
          </text>

          <rect
            x="53"
            y="265"
            width="45"
            height="30"
            rx="2"
            fill="none"
            stroke="#ca8a04"
            strokeWidth="1"
          />
          <rect
            x="133"
            y="265"
            width="45"
            height="30"
            rx="2"
            fill="none"
            stroke="#ca8a04"
            strokeWidth="1"
          />
          <rect
            x="53"
            y="310"
            width="45"
            height="30"
            rx="2"
            fill="none"
            stroke="#ca8a04"
            strokeWidth="1"
          />
          <rect
            x="133"
            y="310"
            width="45"
            height="30"
            rx="2"
            fill="none"
            stroke="#ca8a04"
            strokeWidth="1"
          />

          <rect
            x="240"
            y="220"
            width="190"
            height="160"
            rx="3"
            fill="#fae8ff"
            stroke="#a855f7"
            strokeWidth="1"
          />
          <text x="250" y="240" fill="#7e22ce" fontSize="12" fontWeight="bold">
            Зона D: Тихая зона
          </text>

          <rect
            x="450"
            y="20"
            width="130"
            height="180"
            rx="3"
            fill="#dcfce7"
            stroke="#22c55e"
            strokeWidth="1"
          />
          <text x="460" y="40" fill="#15803d" fontSize="12" fontWeight="bold">
            Зона E: Зона отдыха
          </text>

          <rect
            x="450"
            y="220"
            width="130"
            height="160"
            rx="3"
            fill="#ffedd5"
            stroke="#f97316"
            strokeWidth="1"
          />
          <text x="460" y="240" fill="#c2410c" fontSize="12" fontWeight="bold">
            Кофе-зона
          </text>

          <rect
            x="470"
            y="260"
            width="30"
            height="15"
            rx="2"
            fill="#fdba74"
            stroke="#c2410c"
            strokeWidth="1"
          />
          <text x="485" y="270" fill="#7c2d12" fontSize="7" textAnchor="middle">
            Кофе
          </text>

          <circle cx="490" y="80" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
          <circle cx="490" y="120" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
          <circle cx="490" y="160" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
          <circle cx="540" y="80" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
          <circle cx="540" y="120" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
          <circle cx="540" y="160" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />

          <rect
            x="490"
            y="300"
            width="25"
            height="20"
            rx="2"
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth="1"
          />
          <text x="502" y="315" fill="#334155" fontSize="8" textAnchor="middle">
            WC
          </text>
          <rect
            x="525"
            y="300"
            width="25"
            height="20"
            rx="2"
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth="1"
          />
          <text x="537" y="315" fill="#334155" fontSize="8" textAnchor="middle">
            WC
          </text>

          <circle cx="220" cy="60" r="2.5" fill="#9ca3af" />
          <circle cx="220" cy="130" r="2.5" fill="#9ca3af" />
          <circle cx="220" cy="250" r="2.5" fill="#9ca3af" />
          <circle cx="220" cy="320" r="2.5" fill="#9ca3af" />

          <circle cx="440" cy="60" r="2.5" fill="#9ca3af" />
          <circle cx="440" cy="130" r="2.5" fill="#9ca3af" />
          <circle cx="440" cy="250" r="2.5" fill="#9ca3af" />
          <circle cx="440" cy="320" r="2.5" fill="#9ca3af" />

          <circle cx="100" cy="210" r="2.5" fill="#9ca3af" />
          <circle cx="170" cy="210" r="2.5" fill="#9ca3af" />
          <circle cx="300" cy="210" r="2.5" fill="#9ca3af" />
          <circle cx="370" cy="210" r="2.5" fill="#9ca3af" />
          <circle cx="500" cy="210" r="2.5" fill="#9ca3af" />

          <path d="M220,80 l-3,-6 l6,0 z" fill="#9ca3af" />
          <path d="M220,170 l-3,-6 l6,0 z" fill="#9ca3af" />
          <path d="M220,280 l-3,-6 l6,0 z" fill="#9ca3af" />
          <path d="M220,350 l-3,-6 l6,0 z" fill="#9ca3af" />

          <path d="M440,80 l-3,-6 l6,0 z" fill="#9ca3af" />
          <path d="M440,170 l-3,-6 l6,0 z" fill="#9ca3af" />
          <path d="M440,280 l-3,-6 l6,0 z" fill="#9ca3af" />
          <path d="M440,350 l-3,-6 l6,0 z" fill="#9ca3af" />

          <path d="M120,210 l6,-3 l0,6 z" fill="#9ca3af" />
          <path d="M200,210 l6,-3 l0,6 z" fill="#9ca3af" />
          <path d="M330,210 l6,-3 l0,6 z" fill="#9ca3af" />
          <path d="M400,210 l6,-3 l0,6 z" fill="#9ca3af" />
          <path d="M520,210 l6,-3 l0,6 z" fill="#9ca3af" />

          <text
            x="228"
            y="80"
            fill="#6b7280"
            fontSize="8"
            fontWeight="500"
            transform="rotate(90 228 80)"
          >
            → Зоны A, B
          </text>
          <text
            x="228"
            y="160"
            fill="#6b7280"
            fontSize="8"
            fontWeight="500"
            transform="rotate(90 228 160)"
          >
            → Зона E
          </text>
          <text
            x="228"
            y="260"
            fill="#6b7280"
            fontSize="8"
            fontWeight="500"
            transform="rotate(90 228 260)"
          >
            → Зоны C, D
          </text>
          <text
            x="228"
            y="340"
            fill="#6b7280"
            fontSize="8"
            fontWeight="500"
            transform="rotate(90 228 340)"
          >
            → Кофе-зона
          </text>

          <text
            x="452"
            y="80"
            fill="#6b7280"
            fontSize="8"
            fontWeight="500"
            transform="rotate(90 452 80)"
          >
            → Зона E
          </text>
          <text
            x="452"
            y="260"
            fill="#6b7280"
            fontSize="8"
            fontWeight="500"
            transform="rotate(90 452 260)"
          >
            → Кофе-зона
          </text>
          <text
            x="452"
            y="340"
            fill="#6b7280"
            fontSize="8"
            fontWeight="500"
            transform="rotate(90 452 340)"
          >
            → Туалеты
          </text>

          <text x="120" y="202" fill="#6b7280" fontSize="8" fontWeight="500">
            → Зона C
          </text>
          <text x="300" y="202" fill="#6b7280" fontSize="8" fontWeight="500">
            → Зона D
          </text>
          <text x="500" y="202" fill="#6b7280" fontSize="8" fontWeight="500">
            → Кофе-зона
          </text>

          <circle cx="220" cy="210" r="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
          <circle cx="440" cy="210" r="5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />

          <rect x="215" y="380" width="10" height="5" fill="#475569" />
          <text x="220" y="375" fill="#475569" fontSize="8" textAnchor="middle">
            ВХОД
          </text>

          {seats.map((seat) => (
            <g
              key={seat.id}
              onClick={() => navigate(`/admin/booking/${seat.name}/place`)}
              style={{ cursor: 'pointer' }}
              data-seat="true"
              data-seat-id={seat.id}
            >
              <rect
                x={seat.x - 9}
                y={seat.y - 9}
                width="18"
                height="18"
                rx="2"
                fill={
                  selectedSeat?.id === seat.id
                    ? '#bfdbfe'
                    : seat.isOccupied
                    ? '#f3f4f6'
                    : seat.type === 'desk'
                    ? '#dbeafe'
                    : seat.type === 'office'
                    ? '#ccfbf1'
                    : seat.type === 'meeting'
                    ? '#fef9c3'
                    : seat.type === 'focus'
                    ? '#fae8ff'
                    : '#dcfce7'
                }
                stroke={
                  selectedSeat?.id === seat.id
                    ? '#3b82f6'
                    : seat.isOccupied
                    ? '#d1d5db'
                    : seat.type === 'desk'
                    ? '#60a5fa'
                    : seat.type === 'office'
                    ? '#2dd4bf'
                    : seat.type === 'meeting'
                    ? '#facc15'
                    : seat.type === 'focus'
                    ? '#d946ef'
                    : seat.type === 'focus'
                    ? '#d946ef'
                    : '#4ade80'
                }
                strokeWidth="1"
                data-seat="true"
              />
              <text
                x={seat.x}
                y={seat.y + 3}
                textAnchor="middle"
                fontSize="7"
                fontWeight="500"
                fill={
                  seat.isOccupied
                    ? '#9ca3af'
                    : seat.type === 'desk'
                    ? '#1e40af'
                    : seat.type === 'office'
                    ? '#0f766e'
                    : seat.type === 'meeting'
                    ? '#854d0e'
                    : seat.type === 'focus'
                    ? '#7e22ce'
                    : '#15803d'
                }
                data-seat="true"
              >
                {seat.name}
              </text>
              {seat.isOccupied && (
                <path
                  transform={`translate(${seat.x - 3}, ${seat.y + 5}) scale(0.4)`}
                  d="M4 8V6a4 4 0 118 0v2m1 0h2v8a2 2 0 01-2 2H3a2 2 0 01-2-2v-8h2m2 0h8"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  fill="none"
                  data-seat="true"
                />
              )}
            </g>
          ))}

          <rect x="20" y="385" width="560" height="1" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="30" cy="395" r="5" fill="#dbeafe" stroke="#60a5fa" strokeWidth="1" />
          <text x="40" y="398" fill="#64748b" fontSize="8">
            Рабочее место
          </text>
          <circle cx="100" cy="395" r="5" fill="#ccfbf1" stroke="#2dd4bf" strokeWidth="1" />
          <text x="110" y="398" fill="#64748b" fontSize="8">
            Кабинет
          </text>
          <circle cx="170" cy="395" r="5" fill="#fef9c3" stroke="#facc15" strokeWidth="1" />
          <text x="180" y="398" fill="#64748b" fontSize="8">
            Переговорная
          </text>
          <circle cx="250" cy="395" r="5" fill="#fae8ff" stroke="#d946ef" strokeWidth="1" />
          <text x="260" y="398" fill="#64748b" fontSize="8">
            Тихая зона
          </text>
          <circle cx="320" cy="395" r="5" fill="#dcfce7" stroke="#4ade80" strokeWidth="1" />
          <text x="330" y="398" fill="#64748b" fontSize="8">
            Зона отдыха
          </text>
          <circle cx="400" cy="395" r="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
          <text x="410" y="398" fill="#64748b" fontSize="8">
            Занято
          </text>
          <circle cx="470" cy="395" r="5" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="480" y="398" fill="#64748b" fontSize="8">
            Выбрано
          </text>
        </svg>
      </div>
    </div>
  );
};
const CoworkingBookingAdmin = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedZone, setSelectedZone] = useState('all');
  const [isToday, setIsToday] = useState(true);
  const [popoverSeat, setPopoverSeat] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [timeRange, setTimeRange] = useState({
    start: { hour: 12, minute: 0 },
    end: { hour: 13, minute: 0 },
  });

  const formatDateTimeForAPI = (date, time) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(time.hour).padStart(2, '0');
    const minutes = String(time.minute).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
    setPopoverSeat(seat);

    const seatElement = document.querySelector(`[data-seat-id="${seat.id}"]`);
    if (seatElement) {
      const rect = seatElement.getBoundingClientRect();

      setPopoverPosition({
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + window.scrollY,
      });
    }
  };

  const fetchBook = async () => {
    try {
      const start = formatDateTimeForAPI(selectedDate, timeRange.start);
      const end = formatDateTimeForAPI(selectedDate, timeRange.end);

      const placeData = {
        name: selectedSeat.name,
        startAt: start,
        endAt: end,
      };

      const result = await placeService.post(placeData);
      fetchFreePlaces();
      setPopoverSeat(null);
      setSelectedSeat(null);
    } catch (error) {
      toastManager.showErrorToast(error.response.data);
    }
  };

  const handleBooking = async () => {
    fetchBook();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today.toISOString().split('T')[0];

  const handleStartTimeChange = (newStartTime) => {
    setTimeRange((prev) => ({ ...prev, start: newStartTime }));
  };

  const handleEndTimeChange = (newEndTime) => {
    setTimeRange((prev) => ({ ...prev, end: newEndTime }));
  };

  const getRoundedCurrentTime = () => {
    const current = new Date();
    const totalMinutes = current.getHours() * 60 + current.getMinutes();
    const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
    return {
      hour: Math.floor(roundedMinutes / 60),
      minute: roundedMinutes % 60,
    };
  };

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);

    const isSameDay = today.getTime() === selectedDay.getTime();
    setIsToday(isSameDay);

    if (isSameDay) {
      const current = getRoundedCurrentTime();
      const startMinutes = timeRange.start.hour * 60 + timeRange.start.minute;
      const currentMinutes = current.hour * 60 + current.minute;

      if (startMinutes < currentMinutes) {
        setTimeRange((prev) => ({
          start: current,
          end: calculateEndTime(current, 60),
        }));
      }
    }
  }, [selectedDate]);

  const timePresets = [
    {
      label: 'Утро',
      getRange: () => {
        if (!isToday) {
          return {
            start: { hour: 8, minute: 0 },
            end: { hour: 12, minute: 0 },
          };
        }
        const current = getRoundedCurrentTime();
        const start = Math.max(current.hour * 60 + current.minute, 8 * 60);
        return {
          start: { hour: Math.floor(start / 60), minute: start % 60 },
          end: { hour: 12, minute: 0 },
        };
      },
      isAvailable: () => {
        if (!isToday) return true;
        const current = getRoundedCurrentTime();
        return current.hour < 12;
      },
    },
    {
      label: 'День',
      getRange: () => {
        if (!isToday) {
          return {
            start: { hour: 12, minute: 0 },
            end: { hour: 17, minute: 0 },
          };
        }
        const current = getRoundedCurrentTime();
        const start = Math.max(current.hour * 60 + current.minute, 12 * 60);
        return {
          start: { hour: Math.floor(start / 60), minute: start % 60 },
          end: { hour: 17, minute: 0 },
        };
      },
      isAvailable: () => {
        if (!isToday) return true;
        const current = getRoundedCurrentTime();
        return current.hour < 17;
      },
    },
    {
      label: 'Вечер',
      getRange: () => {
        if (!isToday) {
          return {
            start: { hour: 17, minute: 0 },
            end: { hour: 22, minute: 0 },
          };
        }
        const current = getRoundedCurrentTime();
        const start = Math.max(current.hour * 60 + current.minute, 17 * 60);
        return {
          start: { hour: Math.floor(start / 60), minute: start % 60 },
          end: { hour: 22, minute: 0 },
        };
      },
      isAvailable: () => {
        if (!isToday) return true;
        const current = getRoundedCurrentTime();
        return current.hour < 22;
      },
    },
    {
      label: 'На целый день',
      getRange: () => {
        if (!isToday) {
          return {
            start: { hour: 8, minute: 0 },
            end: { hour: 22, minute: 0 },
          };
        }
        return {
          start: getRoundedCurrentTime(),
          end: { hour: 22, minute: 0 },
        };
      },
      isAvailable: () => {
        if (!isToday) return true;
        const current = getRoundedCurrentTime();
        return current.hour < 22;
      },
    },
    {
      label: 'На весь вечер',
      getRange: () => {
        if (!isToday) {
          return {
            start: { hour: 18, minute: 0 },
            end: { hour: 22, minute: 0 },
          };
        }
        const current = getRoundedCurrentTime();
        const start = Math.max(current.hour * 60 + current.minute, 18 * 60);
        return {
          start: { hour: Math.floor(start / 60), minute: start % 60 },
          end: { hour: 22, minute: 0 },
        };
      },
      isAvailable: () => {
        if (!isToday) return true;
        const current = getRoundedCurrentTime();
        return !isToday || (current.hour >= 18 && current.hour < 22);
      },
    },
  ];

  const formatTime = (time) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const calculateEndTime = (startTime, durationMins) => {
    const totalMinutes = startTime.hour * 60 + startTime.minute + durationMins;
    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    };
  };

  const handleToday = () => setSelectedDate(new Date());

  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
  };

  const handleDateChange = (e) => {
    try {
      const newDate = new Date(e.target.value);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newDate.getTime() < today.getTime()) {
        setSelectedDate(today);
        e.target.value = today.toISOString().split('T')[0];
      } else {
        setSelectedDate(newDate);
      }
    } catch (error) {
      console.error('Invalid date format:', error);
      const today = new Date();
      setSelectedDate(today);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Администрирование коворкинга</h1>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Схема коворкинга</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4" />
                <span>Фильтр</span>
              </button>

              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Тип места</h3>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Все типы</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Опен-спейс</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Кабинеты</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <select
              className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="all">Все зоны</option>
              <option value="a">Зона A: Опен-спейс</option>
              <option value="b">Зона B: Кабинеты</option>
              <option value="c">Зона C: Переговорные</option>
              <option value="d">Зона D: Тихая зона</option>
              <option value="e">Зона E: Отдых</option>
            </select>
          </div>
        </div>

        <div className="mb-6 coworking-map-container">
          <CoworkingMap selectedSeat={selectedSeat} onSeatSelect={handleSeatSelect} />
        </div>

        {popoverSeat && (
          <SeatPopover
            seat={popoverSeat}
            timeRange={timeRange}
            selectedDate={selectedDate}
            onClose={() => setPopoverSeat(null)}
            onBook={handleBooking}
            position={popoverPosition}
          />
        )}

        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Рабочее место</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Кабинет</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Переговорная</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Тихая зона</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Занято</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoworkingBookingAdmin;
