import React, { useEffect, useRef, useState } from "react";

const TimeRangeSlider = ({
                             startTime,
                             endTime,
                             onStartTimeChange,
                             onEndTimeChange,
                             minTime = { hour: 8, minute: 0 },
                             maxTime = { hour: 22, minute: 0 },
                             currentTime = new Date(),
                             isToday = true,
                         }) => {
    const sliderRef = useRef(null);
    const startHandleRef = useRef(null);
    const endHandleRef = useRef(null);
    const [isDraggingStart, setIsDraggingStart] = useState(false);
    const [isDraggingEnd, setIsDraggingEnd] = useState(false);
    const [sliderWidth, setSliderWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const timeToPercent = (time) => {
        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        const totalMinutesTime = time.hour * 60 + time.minute;

        return ((totalMinutesTime - totalMinutesMin) / (totalMinutesMax - totalMinutesMin)) * 100;
    };

    const positionToTime = (position) => {
        const totalMinutesMin = minTime.hour * 60 + minTime.minute;
        const totalMinutesMax = maxTime.hour * 60 + maxTime.minute;
        const totalRange = totalMinutesMax - totalMinutesMin;

        const percent = Math.max(0, Math.min(100, (position / sliderWidth) * 100));
        const totalMinutes = totalMinutesMin + (percent / 100) * totalRange;

        const quarterHours = Math.round(totalMinutes / 15);
        const roundedMinutes = quarterHours * 15;

        return {
            hour: Math.floor(roundedMinutes / 60),
            minute: roundedMinutes % 60,
        };
    };

    const formatTime = (time) => {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    const handleStartDragStart = (e) => {
        e.preventDefault();
        setIsDraggingStart(true);
        setIsDragging(true);
        document.body.style.userSelect = 'none';
    };

    const handleEndDragStart = (e) => {
        e.preventDefault();
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

    const isTimeAvailable = (time) => {
        if (!isToday) return true;

        const roundedCurrent = getRoundedCurrentTime();
        const currentMinutes = roundedCurrent.hour * 60 + roundedCurrent.minute;
        const timeMinutes = time.hour * 60 + time.minute;
        return timeMinutes >= currentMinutes;
    };

    const getRoundedCurrentTime = () => {
        const current = new Date();
        const totalMinutes = current.getHours() * 60 + current.getMinutes();
        const quarterHours = Math.ceil(totalMinutes / 15);
        const roundedMinutes = quarterHours * 15;
        return {
            hour: Math.floor(roundedMinutes / 60),
            minute: roundedMinutes % 60,
        };
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
            const current = getCurrentTimeObj();
            if (!isTimeAvailable(startTime)) {
                onStartTimeChange(current);
            }
            if (!isTimeAvailable(endTime)) {
                onEndTimeChange(current);
            }
        }
    }, [isToday]);

    useEffect(() => {
        const isInitialRender =
            startTime.hour === 0 && startTime.minute === 0 && endTime.hour === 0 && endTime.minute === 0;

        if (isInitialRender) {
            if (isToday) {
                const roundedCurrent = getRoundedCurrentTime();
                onStartTimeChange(roundedCurrent);

                const endMinutes = roundedCurrent.hour * 60 + roundedCurrent.minute + 60;
                onEndTimeChange({
                    hour: Math.floor(endMinutes / 60),
                    minute: endMinutes % 60,
                });
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
                    onEndTimeChange({
                        hour: Math.floor(newEndMinutes / 60),
                        minute: newEndMinutes % 60,
                    });
                }
            }
        }
    }, [isToday]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !sliderRef.current) return;

            const rect = sliderRef.current.getBoundingClientRect();
            const position = e.clientX - rect.left;

            if (isDraggingStart) {
                const newTime = positionToTime(position);

                if (isToday && !isTimeAvailable(newTime)) {
                    onStartTimeChange(getCurrentTimeObj());
                    return;
                }

                const endTotalMinutes = endTime.hour * 60 + endTime.minute;
                const newTotalMinutes = newTime.hour * 60 + newTime.minute;

                if (newTotalMinutes < endTotalMinutes - 15) {
                    onStartTimeChange(newTime);
                } else {
                    const adjustedTime = {
                        hour: Math.floor((endTotalMinutes - 15) / 60),
                        minute: (endTotalMinutes - 15) % 60,
                    };
                    onStartTimeChange(adjustedTime);
                }
            } else if (isDraggingEnd) {
                const newTime = positionToTime(position);

                if (isToday && !isTimeAvailable(newTime)) {
                    onEndTimeChange(getCurrentTimeObj());
                    return;
                }

                const startTotalMinutes = startTime.hour * 60 + startTime.minute;
                const newTotalMinutes = newTime.hour * 60 + newTime.minute;

                if (newTotalMinutes > startTotalMinutes + 15) {
                    onEndTimeChange(newTime);
                } else {
                    const adjustedTime = {
                        hour: Math.floor((startTotalMinutes + 15) / 60),
                        minute: (startTotalMinutes + 15) % 60,
                    };
                    onEndTimeChange(adjustedTime);
                }
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
            document.addEventListener('touchmove', handleMouseMove);
            document.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
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
    ]);

    return (
        <div className="relative h-32 mb-4">
            <div className="absolute top-0 w-full flex justify-between px-1 text-xs text-gray-500">
                {timeMarkers.map((marker, i) => (
                    <div
                        key={i}
                        style={{ position: 'absolute', left: `${marker.position}%` }}
                        className={`flex flex-col items-center ${
                            marker.isHour ? 'font-medium' : 'text-gray-400'
                        }`}
                    >
                        <div className={`h-2 w-0.5 bg-gray-300 mb-1 ${marker.isHour ? 'h-3' : 'h-2'}`}></div>
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
                className="absolute top-7 w-10 h-10 bg-white border-2 border-blue-600 rounded-full shadow-lg transform -translate-x-1/2 cursor-pointer flex items-center justify-center transition-all hover:scale-110 touch-none"
                style={{ left: `${timeToPercent(startTime)}%` }}
                onMouseDown={handleStartDragStart}
                onTouchStart={handleStartDragStart}
            >
                <span className="text-xs select-none font-bold text-blue-600">{formatTime(startTime)}</span>
            </div>

            <div
                ref={endHandleRef}
                className="absolute top-7 w-10 h-10 bg-white border-2 border-blue-600 rounded-full shadow-lg transform -translate-x-1/2 cursor-pointer flex items-center justify-center transition-all hover:scale-110 touch-none"
                style={{ left: `${timeToPercent(endTime)}%` }}
                onMouseDown={handleEndDragStart}
                onTouchStart={handleEndDragStart}
            >
                <span className="text-xs select-none font-bold text-blue-600">{formatTime(endTime)}</span>
            </div>

            <div className="absolute top-20 left-0 right-0 text-center">
                <div className="inline-block bg-blue-100 px-4 py-2 rounded-full text-sm font-medium text-blue-800 shadow-sm">
                    <span className="mr-2 font-bold">С:</span> {formatTime(startTime)}
                    <span className="mx-2 font-bold">До:</span> {formatTime(endTime)}
                    <span className="text-blue-600 ml-2 font-bold">
            (
                        {Math.round(
                            endTime.hour * 60 + endTime.minute - (startTime.hour * 60 + startTime.minute),
                        )}{' '}
                        мин)
          </span>
                </div>
            </div>
        </div>
    );
};
export default TimeRangeSlider;
