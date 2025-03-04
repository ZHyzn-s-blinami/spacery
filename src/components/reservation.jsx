import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Filter } from 'lucide-react';
import { placeService } from '../services/placeService';
import CoworkingMap from './CoworkingMap.jsx';
import SeatPopover from './SeatPopover.jsx';
import TimeRangeSlider from './TimeRangeSlider.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { toastManager } from '../common/toastManager.js';

const CoworkingBooking = ({ isAdmin }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedZone, setSelectedZone] = useState('all');
  const [isToday, setIsToday] = useState(true);
  const [popoverSeat, setPopoverSeat] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [timeRange, setTimeRange] = useState({
    start: { hour: 0, minute: 0 },
    end: { hour: 0, minute: 0 },
  });
  const [freePlaces, setFreePlaces] = useState([]);
  const [isOutsideWorkingHours, setIsOutsideWorkingHours] = useState(false);
  const mapContainerRef = useRef(null);
  const [error, setError] = useState('');

  const minTime = { hour: 8, minute: 0 };
  const maxTime = { hour: 22, minute: 0 };

  const userToken = localStorage.getItem('userToken');

  const debouncedTimeRange = useDebounce(timeRange, 500);

  const formatDateTimeForAPI = (date, time) => {
    if (!date || !time || time.hour === undefined || time.minute === undefined) {
      console.error('Invalid date or time:', { date, time });
      return null;
    }

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

      if (!start || !end) {
        console.error('Invalid start or end time for API request');
        return;
      }

      const data = await placeService.get(start, end);
      setFreePlaces(data);
    } catch (err) {
      console.error('Error fetching places:', err);
    }
  };

  useEffect(() => {
    if (selectedDate && debouncedTimeRange.start && debouncedTimeRange.end && userToken) {
      fetchFreePlaces();
    }
  }, [selectedDate, debouncedTimeRange, userToken]);

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
    setPopoverSeat(seat);
  };

  const fetchBook = async () => {
    try {
      const start = formatDateTimeForAPI(selectedDate, timeRange.start);
      const end = formatDateTimeForAPI(selectedDate, timeRange.end);

      if (!start || !end || !selectedSeat) {
        console.error('Missing required booking data:', { selectedSeat, start, end });
        throw new Error('Missing required booking data');
      }

      const placeData = {
        name: selectedSeat.name,
        startAt: start,
        endAt: end,
      };

      const result = await placeService.post(placeData);
      await fetchFreePlaces();
      toastManager.showSuccessToast('Успешно забронировано');
      return result;
    } catch (error) {
      toastManager.showErrorToast(error.response.data);
      throw error;
    }
  };

  const handleBooking = async () => {
    try {
      return await fetchBook();
    } catch (error) {
      throw error;
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;
  const handleStartTimeChange = (newStartTime) => {
    setTimeRange((prev) => ({ ...prev, start: newStartTime }));
  };

  const handleEndTimeChange = (newEndTime) => {
    setTimeRange((prev) => ({ ...prev, end: newEndTime }));
  };

  const getRoundedCurrentTime = () => {
    const current = new Date();
    const totalMinutes = current.getHours() * 60 + current.getMinutes();
    const quarterHours = Math.ceil(totalMinutes / 15);
    const roundedMinutes = quarterHours * 15;

    const hour = Math.floor(roundedMinutes / 60);
    const minute = roundedMinutes % 60;

    if (hour < minTime.hour || (hour === minTime.hour && minute < minTime.minute)) {
      return minTime;
    }

    if (hour > maxTime.hour || (hour === maxTime.hour && minute > maxTime.minute)) {
      return maxTime;
    }

    return { hour, minute };
  };

  useEffect(() => {
    if (isToday) {
      const current = new Date();
      const currentHour = current.getHours();
      const currentMinute = current.getMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const minTotalMinutes = minTime.hour * 60 + minTime.minute;
      const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

      const outsideHours =
        currentTotalMinutes < minTotalMinutes || currentTotalMinutes >= maxTotalMinutes;
      setIsOutsideWorkingHours(outsideHours);
    } else {
      setIsOutsideWorkingHours(false);
    }
  }, [isToday]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);

    const isSameDay = today.getTime() === selectedDay.getTime();
    const isTomorrow = tomorrow.getTime() === selectedDay.getTime();

    setIsToday(isSameDay);

    if (isSameDay) {
      const current = getRoundedCurrentTime();
      const startMinutes = timeRange.start.hour * 60 + timeRange.start.minute;
      const currentMinutes = current.hour * 60 + current.minute;

      if (startMinutes < currentMinutes || timeRange.start.hour === 0) {
        const endMinutes = currentMinutes + 60;
        const endTime =
          endMinutes > maxTime.hour * 60 + maxTime.minute
            ? maxTime
            : { hour: Math.floor(endMinutes / 60), minute: endMinutes % 60 };

        setTimeRange({
          start: current,
          end: endTime,
        });
      }
    } else if (isTomorrow || timeRange.start.hour === 0 || timeRange.end.hour === 0) {
      setTimeRange({
        start: { hour: 9, minute: 0 },
        end: { hour: 10, minute: 0 },
      });
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
        if (isOutsideWorkingHours) return false;
        if (!isToday) return true;

        const current = new Date();
        const currentTotalMinutes = current.getHours() * 60 + current.getMinutes();

        return (
          currentTotalMinutes < 12 * 60 && currentTotalMinutes < maxTime.hour * 60 + maxTime.minute
        );
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
        if (isOutsideWorkingHours) return false;
        if (!isToday) return true;

        const current = new Date();
        const currentTotalMinutes = current.getHours() * 60 + current.getMinutes();

        return (
          currentTotalMinutes < 17 * 60 && currentTotalMinutes < maxTime.hour * 60 + maxTime.minute
        );
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
        const current = getRoundedCurrentTime();
        return {
          start: current,
          end: { hour: 22, minute: 0 },
        };
      },
      isAvailable: () => {
        if (isOutsideWorkingHours) return false;
        if (!isToday) return true;

        const current = new Date();
        const currentTotalMinutes = current.getHours() * 60 + current.getMinutes();
        const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

        return currentTotalMinutes < maxTotalMinutes - 30;
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
        if (isOutsideWorkingHours) return false;
        if (!isToday) return true;

        const current = new Date();
        const currentTotalMinutes = current.getHours() * 60 + current.getMinutes();
        const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

        return currentTotalMinutes < maxTotalMinutes - 15;
      },
    },
  ];

  const formatTime = (time) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleToday = () => setSelectedDate(new Date());

  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
  };

  const handleDateChange = (e) => {
    try {
      const parts = e.target.value.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);

      const newDate = new Date(year, month, day);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newDate.getTime() < today.getTime()) {
        setSelectedDate(today);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Карта коворкинга</h1>

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
                value={`${selectedDate.getFullYear()}-${String(
                  selectedDate.getMonth() + 1,
                ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
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
              minTime={minTime}
              maxTime={maxTime}
              isToday={isToday}
              disabled={false}
              currentTime={new Date()}
              onOutsideHoursChange={setIsOutsideWorkingHours}
            />

            <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
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
                    disabled={!isAvailable || isOutsideWorkingHours}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      !isAvailable || isOutsideWorkingHours
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        </div>

        <div ref={mapContainerRef} className="mb-6 coworking-map-container relative">
          <CoworkingMap
            selectedSeat={selectedSeat}
            onSeatSelect={handleSeatSelect}
            freePlaces={freePlaces}
            isAdmin={isAdmin}
          />

          {popoverSeat && (
            <SeatPopover
              seat={popoverSeat}
              timeRange={timeRange}
              selectedDate={selectedDate}
              onClose={() => setPopoverSeat(null)}
              onBook={handleBooking}
              containerRef={mapContainerRef}
              isWorkingHours={!isOutsideWorkingHours}
            />
          )}
        </div>

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
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Зона отдыха</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Кофе-зона</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Занято</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Выбрано</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoworkingBooking;
