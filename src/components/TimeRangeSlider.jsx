import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

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
    const trackRef = useRef(null);

    const [activeHandle, setActiveHandle] = useState(null); // 'start', 'end' или null
    const [dragStartPos, setDragStartPos] = useState(0);
    const [initialStartPx, setInitialStartPx] = useState(0);
    const [initialEndPx, setInitialEndPx] = useState(0);
    const [trackWidth, setTrackWidth] = useState(0);

    const [isOutsideWorkingHours, setIsOutsideWorkingHours] = useState(false);

    useEffect(() => {
        if (isToday) {
            const current = getCurrentTimeObj();
            const currentTotalMinutes = current.hour * 60 + current.minute;
            const minTotalMinutes = minTime.hour * 60 + minTime.minute;
            const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

            const outsideHours = currentTotalMinutes < minTotalMinutes || currentTotalMinutes >= maxTotalMinutes;
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
        }
    }, [isToday, isOutsideWorkingHours]);

    useEffect(() => {
        if (isToday) {
            const roundedCurrent = getRoundedCurrentTime();
            const startTotalMinutes = startTime.hour * 60 + startTime.minute;
            const endTotalMinutes = endTime.hour * 60 + endTime.minute;
            const currentTotalMinutes = roundedCurrent.hour * 60 + roundedCurrent.minute;

            if (startTotalMinutes < currentTotalMinutes) {
                onStartTimeChange(roundedCurrent);
            }

            if (endTotalMinutes < currentTotalMinutes) {
                onEndTimeChange(roundedCurrent);
            }

            if (endTotalMinutes <= startTotalMinutes) {
                const newEndMinutes = startTotalMinutes + 60;
                const maxTotalMinutes = maxTime.hour * 60 + maxTime.minute;

                if (newEndMinutes <= maxTotalMinutes) {
                    onEndTimeChange({
                        hour: Math.floor(newEndMinutes / 60),
                        minute: newEndMinutes % 60
                    });
                } else {
                    onEndTimeChange(maxTime);
                }
            }
        }
    }, [isToday, startTime, endTime]);

    useEffect(() => {
        const updateDimensions = () => {
            if (trackRef.current) {
                setTrackWidth(trackRef.current.offsetWidth);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const handleMouseDown = (e, handle) => {
        if (disabled || isOutsideWorkingHours) return;
        e.preventDefault();

        if (handle === 'track-click') {
            const rect = trackRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            setActiveHandle('track-click');

            setDragStartPos(e.clientX);
            return;
        }

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        setDragStartPos(clientX);
        setActiveHandle(handle);

        const rect = trackRef.current.getBoundingClientRect();
        const startPosition = timeToPixels(startTime, rect.width);
        const endPosition = timeToPixels(endTime, rect.width);

        setInitialStartPx(startPosition);
        setInitialEndPx(endPosition);

        e.stopPropagation();
        document.body.style.userSelect = 'none';
    };

    const handleTrackClick = (e) => {
        if (disabled || isOutsideWorkingHours) return;
        handleMouseDown(e, 'track-click');
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!activeHandle || disabled || isOutsideWorkingHours || !trackRef.current) return;

            const rect = trackRef.current.getBoundingClientRect();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;

            if (activeHandle === 'track-click') {
                const clickX = clientX - rect.left;
                const startPx = timeToPixels(startTime, rect.width);
                const endPx = timeToPixels(endTime, rect.width);
                const midPoint = (startPx + endPx) / 2;

                if (clickX < midPoint) {
                    const newStartTime = pixelsToTime(clickX, rect.width);
                    const endTimeMinutes = endTime.hour * 60 + endTime.minute;
                    const newStartTimeMinutes = newStartTime.hour * 60 + newStartTime.minute;

                    if (endTimeMinutes - newStartTimeMinutes >= 15) {
                        onStartTimeChange(newStartTime);
                    }
                } else {
                    const newEndTime = pixelsToTime(clickX, rect.width);
                    const startTimeMinutes = startTime.hour * 60 + startTime.minute;
                    const newEndTimeMinutes = newEndTime.hour * 60 + newEndTime.minute;

                    if (newEndTimeMinutes - startTimeMinutes >= 15) {
                        onEndTimeChange(newEndTime);
                    }
                }

                setActiveHandle(null);
                return;
            }

            const deltaX = clientX - dragStartPos;

            if (activeHandle === 'start') {
                let newStartPx = initialStartPx + deltaX;

                const minStartPx = 0;
                const maxStartPx = initialEndPx - (15 / (14 * 60)) * rect.width;

                if (isToday) {
                    const currentPx = timeToPixels(getCurrentTimeObj(), rect.width);
                    if (newStartPx < currentPx) {
                        newStartPx = currentPx;
                    }
                }

                newStartPx = Math.max(minStartPx, Math.min(maxStartPx, newStartPx));

                onStartTimeChange(pixelsToTime(newStartPx, rect.width));
            } else if (activeHandle === 'end') {
                let newEndPx = initialEndPx + deltaX;

                const minEndPx = initialStartPx + (15 / (14 * 60)) * rect.width; // Минимум 15 минут между ручками
                const maxEndPx = rect.width;

                newEndPx = Math.max(minEndPx, Math.min(maxEndPx, newEndPx));

                onEndTimeChange(pixelsToTime(newEndPx, rect.width));
            } else if (activeHandle === 'range') {
                let newStartPx = initialStartPx + deltaX;
                let newEndPx = initialEndPx + deltaX;
                const rangeWidth = initialEndPx - initialStartPx;

                // Ограничения
                if (newStartPx < 0) {
                    newStartPx = 0;
                    newEndPx = rangeWidth;
                }

                if (newEndPx > rect.width) {
                    newEndPx = rect.width;
                    newStartPx = rect.width - rangeWidth;
                }

                if (isToday) {
                    const currentPx = timeToPixels(getCurrentTimeObj(), rect.width);
                    if (newStartPx < currentPx) {
                        const offset = currentPx - newStartPx;
                        newStartPx = currentPx;
                        newEndPx += offset;

                        if (newEndPx > rect.width) {
                            newEndPx = rect.width;
                        }
                    }
                }

                onStartTimeChange(pixelsToTime(newStartPx, rect.width));
                onEndTimeChange(pixelsToTime(newEndPx, rect.width));
            }
        };

        const handleMouseUp = () => {
            setActiveHandle(null);
            document.body.style.userSelect = '';
        };

        const handleTouchMove = (e) => {
            if (activeHandle) {
                e.preventDefault();
                handleMouseMove(e);
            }
        };

        if (activeHandle) {
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
    }, [activeHandle, dragStartPos, initialStartPx, initialEndPx, disabled, isOutsideWorkingHours]);

    const getCurrentTimeObj = () => {
        return {
            hour: currentTime.getHours(),
            minute: currentTime.getMinutes(),
        };
    };

    const getRoundedCurrentTime = () => {
        const current = currentTime;
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

    const timeToPixels = (time, width) => {
        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        const totalMinutesTime = time.hour * 60 + time.minute;
        const totalRange = totalMinutesMax - totalMinutesMin;

        const percent = (totalMinutesTime - totalMinutesMin) / totalRange;
        return Math.round(percent * width);
    };

    const pixelsToTime = (pixels, width) => {
        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        const totalRange = totalMinutesMax - totalMinutesMin;

        const percent = pixels / width;

        let totalMinutes = totalMinutesMin + percent * totalRange;

        const quarterHours = Math.round(totalMinutes / 15);
        totalMinutes = quarterHours * 15;

        if (totalMinutes < totalMinutesMin) {
            totalMinutes = totalMinutesMin;
        } else if (totalMinutes > totalMinutesMax) {
            totalMinutes = totalMinutesMax;
        }

        return {
            hour: Math.floor(totalMinutes / 60),
            minute: totalMinutes % 60,
        };
    };

    const formatTime = (time) => {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    const generateTimeMarkers = () => {
        const markers = [];
        for (let hour = minTime.hour; hour <= maxTime.hour; hour++) {
            markers.push({
                time: `${hour}:00`,
                hour,
                minute: 0,
                isHour: true,
            });

            if (hour < maxTime.hour || maxTime.minute >= 30) {
                markers.push({
                    time: `${hour}:30`,
                    hour,
                    minute: 30,
                    isHour: false,
                });
            }
        }
        return markers;
    };

    const timeMarkers = generateTimeMarkers();

    const getScaleFactor = () => {
        if (!trackWidth) return 1;
        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        return trackWidth / (totalMinutesMax - totalMinutesMin);
    };

    const startTimePercent = () => {
        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        const totalMinutesStart = startTime.hour * 60 + startTime.minute;
        return ((totalMinutesStart - totalMinutesMin) / (totalMinutesMax - totalMinutesMin)) * 100;
    };

    const endTimePercent = () => {
        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        const totalMinutesEnd = endTime.hour * 60 + endTime.minute;
        return ((totalMinutesEnd - totalMinutesMin) / (totalMinutesMax - totalMinutesMin)) * 100;
    };

    const currentTimePercent = () => {
        const current = getCurrentTimeObj();
        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        const totalMinutesCurrent = current.hour * 60 + current.minute;
        return ((totalMinutesCurrent - totalMinutesMin) / (totalMinutesMax - totalMinutesMin)) * 100;
    };

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
                            Бронирование доступно с <span className="font-bold">{formatTime(minTime)}</span> до <span className="font-bold">{formatTime(maxTime)}</span>
                        </p>
                    </div>
                </div>
            ) : (
                <div className={`relative h-40 md:h-32 mb-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="absolute top-0 w-full flex justify-between px-1 text-xs text-gray-500">
                        {timeMarkers.map((marker, i) => {
                            const percent = ((marker.hour * 60 + marker.minute - (minTime.hour * 60 + minTime.minute)) /
                                ((maxTime.hour * 60 + maxTime.minute) - (minTime.hour * 60 + minTime.minute))) * 100;

                            return (
                                <div
                                    key={i}
                                    style={{ position: 'absolute', left: `${percent}%` }}
                                    className={`flex flex-col items-center ${
                                        marker.isHour ? 'font-medium' : 'text-gray-400'
                                    }`}
                                >
                                    <div className={`h-2 w-0.5 bg-gray-300 mb-1 ${marker.isHour ? 'h-3' : 'h-2'}`}></div>
                                    {marker.isHour && <span className="text-xs">{marker.hour}</span>}
                                </div>
                            );
                        })}
                    </div>

                    <div
                        ref={trackRef}
                        className="absolute inset-x-0 top-10 h-4 bg-gray-200 rounded-full cursor-pointer"
                        onMouseDown={handleTrackClick}
                        onTouchStart={handleTrackClick}
                    >
                        {isToday && (
                            <div
                                className="absolute h-full bg-gray-400 opacity-50 rounded-l-full"
                                style={{
                                    width: `${Math.min(100, currentTimePercent())}%`,
                                    left: 0,
                                }}
                            ></div>
                        )}

                        <div
                            className="absolute h-full bg-blue-500 rounded-full cursor-pointer"
                            style={{
                                left: `${startTimePercent()}%`,
                                width: `${endTimePercent() - startTimePercent()}%`,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'range')}
                            onTouchStart={(e) => handleMouseDown(e, 'range')}
                        >
                        </div>
                    </div>

                    <div
                        className="absolute top-7 w-10 h-10 bg-white border-2 border-blue-600 rounded-full shadow-lg transform -translate-x-1/2 cursor-pointer flex items-center justify-center hover:scale-110 active:scale-110 z-30 pointer-events-auto"
                        style={{ left: `${startTimePercent()}%` }}
                        onMouseDown={(e) => handleMouseDown(e, 'start')}
                        onTouchStart={(e) => handleMouseDown(e, 'start')}
                    >
                        <span className="text-xs select-none font-bold text-blue-600">{formatTime(startTime)}</span>
                    </div>

                    <div
                        className="absolute top-7 w-10 h-10 bg-white border-2 border-blue-600 rounded-full shadow-lg transform -translate-x-1/2 cursor-pointer flex items-center justify-center hover:scale-110 active:scale-110 z-30 pointer-events-auto"
                        style={{ left: `${endTimePercent()}%` }}
                        onMouseDown={(e) => handleMouseDown(e, 'end')}
                        onTouchStart={(e) => handleMouseDown(e, 'end')}
                    >
                        <span className="text-xs select-none font-bold text-blue-600">{formatTime(endTime)}</span>
                    </div>

                    <div className="absolute top-20 md:top-20 left-0 right-0 text-center">
                        <div className="inline-block bg-blue-100 px-4 py-2 rounded-full text-sm font-medium text-blue-800 shadow-sm">
                            <span className="mr-2 font-bold">С:</span> {formatTime(startTime)}
                            <span className="mx-2 font-bold">До:</span> {formatTime(endTime)}
                            <span className="text-blue-600 ml-2 font-bold">
                ({Math.round(
                                endTime.hour * 60 + endTime.minute - (startTime.hour * 60 + startTime.minute),
                            )}{' '}
                                мин)
              </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TimeRangeSlider;