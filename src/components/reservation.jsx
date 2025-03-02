import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Filter } from 'lucide-react';
import { placeService } from '../services/placeService';
import CoworkingMap from './CoworkingMap.jsx';
import SeatPopover from './SeatPopover.jsx';
import TimeRangeSlider from './TimeRangeSlider.jsx';
import toast from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce.js';

const CoworkingBooking = () => {
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
  const [freePlaces, setFreePlaces] = useState([]);

  const debouncedTimeRange = useDebounce(timeRange, 500);

  const formatDateTimeForAPI = (date, time) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(time.hour).padStart(2, '0');
    const minutes = String(time.minute).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  const fetchFreePlaces = async () => {
    try {
      const start = formatDateTimeForAPI(selectedDate, timeRange.start);
      const end = formatDateTimeForAPI(selectedDate, timeRange.end);
      const data = await placeService.get(start, end);
      setFreePlaces(data);
    } catch (err) {
      console.error('Error fetching places:', err);
    }
  };

  useEffect(() => {
    if (selectedDate && debouncedTimeRange.start && debouncedTimeRange.end) {
      fetchFreePlaces();
    }
  }, [selectedDate, debouncedTimeRange]);

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
      console.log(result);
      fetchFreePlaces();
      console.log(fetchFreePlaces());
      setPopoverSeat(null);
      setSelectedSeat(null);
      toast.success('Успешно забронировано');
    } catch (error) {
      console.error('Ошибка при создании бронирования: ', error);
      toast.error('Ошибка при бронировании');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Бронирование коворкинга</h1>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <Calendar className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Дата и время</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleToday}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDate.toDateString() === new Date().toDateString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Сегодня
              </button>
              <button
                onClick={handleTomorrow}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDate.toDateString() ===
                  new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Завтра
              </button>
            </div>

            <div className="relative">
              <input
                type="date"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                min={minDate}
                onKeyDown={(e) => e.preventDefault()}
              />
              <span className="absolute top-3 right-4 text-gray-400"></span>
            </div>
            <p className="mt-3 text-sm text-gray-500 font-medium">{formatDate(selectedDate)}</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">Время бронирования</span>
            </div>

            <TimeRangeSlider
              startTime={timeRange.start}
              endTime={timeRange.end}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
              minTime={{ hour: 8, minute: 0 }}
              maxTime={{ hour: 22, minute: 0 }}
              isToday={isToday}
            />

            <div className="flex flex-wrap gap-2 mt-4">
              {timePresets.map((preset, i) => {
                const isAvailable = preset.isAvailable();
                const range = preset.getRange();
                const isActive =
                  timeRange.start.hour === range.start.hour &&
                  timeRange.start.minute === range.start.minute &&
                  timeRange.end.hour === range.end.hour &&
                  timeRange.end.minute === range.end.minute;

                return (
                  <button
                    key={i}
                    onClick={() => setTimeRange(range)}
                    disabled={!isAvailable}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isAvailable
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
          <CoworkingMap
            selectedSeat={selectedSeat}
            onSeatSelect={handleSeatSelect}
            freePlaces={freePlaces}
          />
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

export default CoworkingBooking;
