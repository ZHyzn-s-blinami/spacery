import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

const TimeRangeSlider = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  minTime = { hour: 8, minute: 0 },
  maxTime = { hour: 22, minute: 0 },
  currentTime = new Date(),
  isToday = true,
  disabled = false,
  onOutsideHoursChange,
}) => {
  const sliderRef = useRef(null);
  const startHandleRef = useRef(null);
  const endHandleRef = useRef(null);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOutsideWorkingHours, setIsOutsideWorkingHours] = useState(false);

  useEffect(() => {
    if (isToday) {
      const current = getCurrentTimeObj();
      const currentTotalMinutes = current.hour * 60 + current.minute;
      const minTotalMinutes = minTime.hour * 60 + minTime.minute;
      const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

      const outsideHours =
        currentTotalMinutes < minTotalMinutes || currentTotalMinutes >= maxTotalMinutes;
      setIsOutsideWorkingHours(outsideHours);

      if (onOutsideHoursChange) {
        onOutsideHoursChange(outsideHours);
      }
    } else {
      setIsOutsideWorkingHours(false);

      if (onOutsideHoursChange) {
        onOutsideHoursChange(false);
      }
    }
  }, [isToday, currentTime, minTime, maxTime, onOutsideHoursChange]);

  const timeToPercent = (time) => {
    const totalMinutesMin = minTime.hour * 60 + minTime.minute;
    const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
    const totalMinutesTime = time.hour * 60 + time.minute;

    const percent =
      ((totalMinutesTime - totalMinutesMin) / (totalMinutesMax - totalMinutesMin)) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const positionToTime = (position) => {
    const totalMinutesMin = minTime.hour * 60 + minTime.minute;
    const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
    const totalRange = totalMinutesMax - totalMinutesMin;

    position = Math.max(0, Math.min(sliderWidth, position));

    const percent = Math.max(0, Math.min(100, (position / sliderWidth) * 100));
    const totalMinutes = totalMinutesMin + (percent / 100) * totalRange;

    const quarterHours = Math.round(totalMinutes / 15);
    const roundedMinutes = quarterHours * 15;

    if (roundedMinutes < totalMinutesMin) {
      return {
        hour: minTime.hour,
        minute: minTime.minute,
      };
    } else if (roundedMinutes > totalMinutesMax) {
      return {
        hour: maxTime.hour,
        minute: maxTime.minute,
      };
    }

    return {
      hour: Math.floor(roundedMinutes / 60),
      minute: roundedMinutes % 60,
    };
  };

  const formatTime = (time) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  const handleStartDragStart = (e) => {
    if (disabled || isOutsideWorkingHours) return;
    if (e.type !== 'touchstart') {
      e.preventDefault();
    }
    setIsDraggingStart(true);
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  };

  const handleEndDragStart = (e) => {
    if (disabled || isOutsideWorkingHours) return;
    if (e.type !== 'touchstart') {
      e.preventDefault();
    }
    setIsDraggingEnd(true);
    setIsDragging(true);
    document.body.style.userSelect = 'none';
  };

  const generateTimeMarkers = () => {
    const markers = [];
    for (let hour = minTime.hour; hour <= maxTime.hour; hour++) {
      markers.push({
        time: `${hour}:00`,
        position: timeToPercent({ hour, minute: 0 }),
        isHour: true,
      });

      if (hour < maxTime.hour || maxTime.minute >= 30) {
        markers.push({
          time: `${hour}:30`,
          position: timeToPercent({ hour, minute: 30 }),
          isHour: false,
        });
      }
    }
    return markers;
  };

  const getCurrentTimeObj = () => {
    return {
      hour: currentTime.getHours(),
      minute: currentTime.getMinutes(),
    };
  };

  const formatDuration = (start, end) => {
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;
    const diffMinutes = endMinutes - startMinutes;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} ч ${minutes.toString().padStart(2, '0')} м`;
    } else if (hours > 0) {
      return `${hours} ч 00 м`;
    } else {
      return `0 ч ${minutes.toString().padStart(2, '0')} м`;
    }
  };

  const isTimeAvailable = (time) => {
    if (!isToday) return true;

    const roundedCurrent = getRoundedCurrentTime();
    const currentMinutes = roundedCurrent.hour * 60 + roundedCurrent.minute;
    const timeMinutes = time.hour * 60 + time.minute;

    const minTotalMinutes = minTime.hour * 60 + minTime.minute;
    const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

    return (
      timeMinutes >= currentMinutes &&
      timeMinutes >= minTotalMinutes &&
      timeMinutes <= maxTotalMinutes
    );
  };

  const getRoundedCurrentTime = () => {
    const current = new Date();
    const totalMinutes = current.getHours() * 60 + current.getMinutes();
    const quarterHours = Math.ceil(totalMinutes / 15);
    const roundedMinutes = quarterHours * 15;

    const hour = Math.floor(roundedMinutes / 60);
    const minute = roundedMinutes % 60;

    if (hour > maxTime.hour || (hour === maxTime.hour && minute > maxTime.minute)) {
      return { hour: maxTime.hour, minute: maxTime.minute };
    }

    if (hour < minTime.hour || (hour === minTime.hour && minute < minTime.minute)) {
      return { hour: minTime.hour, minute: minTime.minute };
    }

    return { hour, minute };
  };

  const timeMarkers = generateTimeMarkers();

  useEffect(() => {
    const updateSliderWidth = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    };

    updateSliderWidth();
    window.addEventListener('resize', updateSliderWidth);
    return () => window.removeEventListener('resize', updateSliderWidth);
  }, []);

  useEffect(() => {
    if (isToday) {
      const roundedCurrent = getRoundedCurrentTime();
      if (!isTimeAvailable(startTime)) {
        onStartTimeChange(roundedCurrent);
      }
      if (!isTimeAvailable(endTime)) {
        onEndTimeChange(roundedCurrent);
      }

      const startTotalMinutes = startTime.hour * 60 + startTime.minute;
      const endTotalMinutes = endTime.hour * 60 + endTime.minute;

      if (endTotalMinutes < startTotalMinutes) {
        const newEndTotalMinutes = startTotalMinutes + 60;
        const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

        if (newEndTotalMinutes <= maxTotalMinutes) {
          onEndTimeChange({
            hour: Math.floor(newEndTotalMinutes / 60),
            minute: newEndTotalMinutes % 60,
          });
        } else {
          onEndTimeChange(maxTime);
        }
      }
    }
  }, [isToday, startTime, endTime]);

  useEffect(() => {
    const isInitialRender =
      startTime.hour === 0 && startTime.minute === 0 && endTime.hour === 0 && endTime.minute === 0;

    if (isInitialRender) {
      if (isToday) {
        const roundedCurrent = getRoundedCurrentTime();

        if (isOutsideWorkingHours) {
          onStartTimeChange(minTime);
          onEndTimeChange({
            hour: minTime.hour + 1,
            minute: minTime.minute,
          });
        } else {
          onStartTimeChange(roundedCurrent);

          const endMinutes = roundedCurrent.hour * 60 + roundedCurrent.minute + 60;
          const maxMinutes = maxTime.hour * 60 + maxTime.minute;

          if (endMinutes > maxMinutes) {
            onEndTimeChange(maxTime);
          } else {
            onEndTimeChange({
              hour: Math.floor(endMinutes / 60),
              minute: endMinutes % 60,
            });
          }
        }
      } else {
        onStartTimeChange({ hour: 9, minute: 0 });
        onEndTimeChange({ hour: 10, minute: 0 });
      }
    } else if (isToday) {
      const roundedCurrent = getRoundedCurrentTime();
      if (!isTimeAvailable(startTime)) {
        onStartTimeChange(roundedCurrent);

        const startMinutes = roundedCurrent.hour * 60 + roundedCurrent.minute;
        const endMinutes = endTime.hour * 60 + endTime.minute;

        if (endMinutes < startMinutes + 60) {
          const newEndMinutes = startMinutes + 60;
          const maxMinutes = maxTime.hour * 60 + maxTime.minute;

          if (newEndMinutes > maxMinutes) {
            onEndTimeChange(maxTime);
          } else {
            onEndTimeChange({
              hour: Math.floor(newEndMinutes / 60),
              minute: newEndMinutes % 60,
            });
          }
        }
      }
    }
  }, [isToday, isOutsideWorkingHours]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sliderRef.current || disabled || isOutsideWorkingHours) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const position = e.clientX - rect.left;

      if (isDraggingStart) {
        const rect = sliderRef.current.getBoundingClientRect();
        const sliderWidth = rect.width;

        const currentTimeObj = getCurrentTimeObj();
        const currentTotalMinutes = isToday
          ? currentTimeObj.hour * 60 + currentTimeObj.minute
          : minTime.hour * 60 + minTime.minute;

        const effectiveMinTime = isToday
          ? Math.max(currentTotalMinutes, minTime.hour * 60 + minTime.minute)
          : minTime.hour * 60 + minTime.minute;

        const minTotalMinutes = minTime.hour * 60 + minTime.minute;
        const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;
        const totalRange = maxTotalMinutes - minTotalMinutes;

        const effectiveMinPercent = ((effectiveMinTime - minTotalMinutes) / totalRange) * 100;
        const effectiveMinPx = (effectiveMinPercent / 100) * sliderWidth;

        const endTotalMinutes = endTime.hour * 60 + endTime.minute;
        const endPositionPercent = timeToPercent(endTime);
        const endPositionPx = (endPositionPercent / 100) * sliderWidth;

        const fifteenMinutesInPixels = (15 / totalRange) * sliderWidth;

        const maxAllowedPosition = endPositionPx - fifteenMinutesInPixels;

        const limitedPosition = Math.min(maxAllowedPosition, Math.max(effectiveMinPx, position));

        const newTime = positionToTime(limitedPosition);

        onStartTimeChange(newTime);
      } else if (isDraggingEnd) {
        const rect = sliderRef.current.getBoundingClientRect();
        const sliderWidth = rect.width;

        const startTotalMinutes = startTime.hour * 60 + startTime.minute;
        const startPositionPercent = timeToPercent(startTime);
        const startPositionPx = (startPositionPercent / 100) * sliderWidth;

        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        const totalRange = totalMinutesMax - totalMinutesMin;

        const fifteenMinutesInPixels = (15 / totalRange) * sliderWidth;

        const minAllowedPosition = startPositionPx + fifteenMinutesInPixels;
        const limitedPosition = Math.max(minAllowedPosition, position);

        const newTime = positionToTime(limitedPosition);

        const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

        if (newTime.hour * 60 + newTime.minute > maxTotalMinutes) {
          onEndTimeChange(maxTime);
          return;
        }

        onEndTimeChange(newTime);
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging || !sliderRef.current || disabled || isOutsideWorkingHours) return;

      const touch = e.touches[0];
      const rect = sliderRef.current.getBoundingClientRect();
      const position = touch.clientX - rect.left;
      const sliderWidth = rect.width;

      const minTotalMinutes = minTime.hour * 60 + minTime.minute;
      const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;
      const totalRange = maxTotalMinutes - minTotalMinutes;
      const fifteenMinutesInPixels = (15 / totalRange) * sliderWidth;

      if (isDraggingStart) {
        const currentTimeObj = getCurrentTimeObj();
        const currentTotalMinutes = isToday
          ? currentTimeObj.hour * 60 + currentTimeObj.minute
          : minTime.hour * 60 + minTime.minute;

        const effectiveMinTime = isToday
          ? Math.max(currentTotalMinutes, minTotalMinutes)
          : minTotalMinutes;

        const effectiveMinPercent = ((effectiveMinTime - minTotalMinutes) / totalRange) * 100;
        const effectiveMinPx = (effectiveMinPercent / 100) * sliderWidth;

        const endTotalMinutes = endTime.hour * 60 + endTime.minute;
        const endPositionPercent = timeToPercent(endTime);
        const endPositionPx = (endPositionPercent / 100) * sliderWidth;

        const maxAllowedPosition = endPositionPx - fifteenMinutesInPixels;

        const limitedPosition = Math.min(maxAllowedPosition, Math.max(effectiveMinPx, position));

        const newTime = positionToTime(limitedPosition);

        onStartTimeChange(newTime);
      } else if (isDraggingEnd) {
        const startTotalMinutes = startTime.hour * 60 + startTime.minute;
        const startPositionPercent = timeToPercent(startTime);
        const startPositionPx = (startPositionPercent / 100) * sliderWidth;

        const minAllowedPosition = startPositionPx + fifteenMinutesInPixels;

        const limitedPosition = Math.max(minAllowedPosition, Math.min(sliderWidth, position));

        const newTime = positionToTime(limitedPosition);

        if (newTime.hour * 60 + newTime.minute > maxTotalMinutes) {
          onEndTimeChange(maxTime);
          return;
        }

        onEndTimeChange(newTime);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [
    isDragging,
    isDraggingStart,
    isDraggingEnd,
    startTime,
    endTime,
    onStartTimeChange,
    onEndTimeChange,
    isToday,
    disabled,
    isOutsideWorkingHours,
  ]);

  useEffect(() => {
    const preventScroll = (e) => {
      if (isDragging) {
        let target = e.target;
        let isPartOfSlider = false;

        while (target) {
          if (
            target === sliderRef.current ||
            target === startHandleRef.current ||
            target === endHandleRef.current
          ) {
            isPartOfSlider = true;
            break;
          }
          target = target.parentElement;
        }

        if (isPartOfSlider) {
          e.preventDefault();
        }
      }
    };

    if (sliderRef.current) {
      sliderRef.current.addEventListener('touchmove', preventScroll, { passive: false });
    }

    return () => {
      if (sliderRef.current) {
        sliderRef.current.removeEventListener('touchmove', preventScroll);
      }
    };
  }, [isDragging, sliderRef.current]);

  return (
    <>
      {isOutsideWorkingHours && isToday ? (
        <div className="h-40 md:h-32 mb-4 flex items-center justify-center">
          <div className="text-center bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 rounded-xl shadow-sm border border-red-200 max-w-md w-full">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">Коворкинг закрыт</span>
            </div>
            <p className="text-red-700">
              Бронирование доступно с <span className="font-bold">{formatTime(minTime)}</span> до{' '}
              <span className="font-bold">{formatTime(maxTime)}</span>
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`relative h-40 md:h-32 mb-4 ${
            disabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div className="absolute top-0 w-full flex justify-between px-1 text-xs text-gray-500">
            {timeMarkers.map((marker, i) => (
              <div
                key={i}
                style={{ position: 'absolute', left: `${marker.position}%` }}
                className={`flex flex-col items-center ${
                  marker.isHour ? 'font-medium' : 'text-gray-400'
                }`}
              >
                <div
                  className={`h-2 w-0.5 bg-gray-300 mb-1 ${marker.isHour ? 'h-3' : 'h-2'}`}
                ></div>
                {marker.isHour && <span className="text-xs">{marker.time.split(':')[0]}</span>}
              </div>
            ))}
          </div>

          <div ref={sliderRef} className="absolute inset-x-0 top-10 h-4 bg-gray-200 rounded-full">
            {isToday && (
              <div
                className="absolute h-full bg-gray-400 opacity-50 rounded-l-full"
                style={{
                  width: `${Math.min(100, timeToPercent(getCurrentTimeObj()))}%`,
                  left: 0,
                }}
              ></div>
            )}
            <div
              className="absolute h-full bg-blue-500 rounded-full"
              style={{
                left: `${timeToPercent(startTime)}%`,
                width: `${timeToPercent(endTime) - timeToPercent(startTime)}%`,
              }}
            ></div>
          </div>

          <div
            ref={startHandleRef}
            className="absolute top-7 w-10 h-10 bg-white border-2 border-blue-600 rounded-full shadow-lg transform -translate-x-1/2 cursor-pointer flex items-center justify-center transition-all hover:scale-110 touch-none active:scale-110"
            style={{ left: `${timeToPercent(startTime)}%` }}
            onMouseDown={handleStartDragStart}
            onTouchStart={handleStartDragStart}
          >
            <span className="text-xs select-none font-bold text-blue-600">
              {formatTime(startTime)}
            </span>
          </div>

          <div
            ref={endHandleRef}
            className="absolute top-7 w-10 h-10 bg-white border-2 border-blue-600 rounded-full shadow-lg transform -translate-x-1/2 cursor-pointer flex items-center justify-center transition-all hover:scale-110 touch-none active:scale-110"
            style={{ left: `${timeToPercent(endTime)}%` }}
            onMouseDown={handleEndDragStart}
            onTouchStart={handleEndDragStart}
          >
            <span className="text-xs select-none font-bold text-blue-600">
              {formatTime(endTime)}
            </span>
          </div>

          <div className="absolute top-20 md:top-20 left-0 right-0 text-center">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-full text-sm font-medium text-blue-800 shadow-sm min-w-[240px]">
              <div className="flex items-center justify-center space-x-1">
                <div className="flex items-center">
                  <span className="font-bold">С:</span>
                  <span className="ml-1 w-12 text-center">{`${startTime.hour}:${startTime.minute
                    .toString()
                    .padStart(2, '0')}`}</span>
                </div>

                <div className="flex items-center">
                  <span className="font-bold">До:</span>
                  <span className="ml-1 w-12 text-center">{`${endTime.hour}:${endTime.minute
                    .toString()
                    .padStart(2, '0')}`}</span>
                </div>

                <div className="flex items-center">
                  <span className="text-blue-600 font-bold w-[75px] text-center">
                    ({formatDuration(startTime, endTime)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimeRangeSlider;
