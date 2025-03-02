import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserMeetings } from "../../store/user/thunks";
import MeetingItem from "./MeetingItem";
import { CalendarIcon, RefreshCwIcon } from "lucide-react";

const MeetingList = () => {
    const dispatch = useDispatch();
    const meetings = useSelector(state => state.booking.meetings);
    const loading = useSelector(state => state.booking.loading);
    const error = useSelector(state => state.booking.error);
    const [groupedMeetings, setGroupedMeetings] = useState({});

    useEffect(() => {
        dispatch(fetchUserMeetings());
    }, [dispatch]);

    useEffect(() => {
        if (meetings && meetings.length > 0) {
            const pendingMeetings = meetings.filter(item =>
                item && item.status === "PENDING" && item.startAt && item.endAt
            );

            const grouped = pendingMeetings.reduce((acc, meeting) => {
                try {
                    const date = new Date(meeting.startAt).toLocaleDateString();
                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(meeting);
                } catch (error) {
                    console.error("Ошибка при обработке встречи:", error);
                }
                return acc;
            }, {});

            const sortedGrouped = Object.keys(grouped)
                .sort((a, b) => new Date(a) - new Date(b))
                .reduce((acc, date) => {
                    acc[date] = grouped[date];
                    return acc;
                }, {});

            setGroupedMeetings(sortedGrouped);
        }
    }, [meetings]);

    const refreshMeetings = () => {
        dispatch(fetchUserMeetings());
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-red-600 mb-3">Не удалось загрузить встречи: {error}</p>
                <button
                    onClick={refreshMeetings}
                    className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                    <RefreshCwIcon size={16} className="mr-2" />
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (Object.keys(groupedMeetings).length === 0) {
        return (
            <div className="text-center py-12">
                <CalendarIcon size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">У вас нет предстоящих встреч</h3>
                <p className="text-gray-500 mb-6">Забронируйте место для вашей следующей встречи</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-sm">
                    Забронировать место
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-800">
                    Ваши бронирования ({Object.values(groupedMeetings).flat().length})
                </h3>
                <button
                    onClick={refreshMeetings}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm bg-blue-50 px-3 py-2 rounded-lg"
                >
                    <RefreshCwIcon size={14} className="mr-2" /> Обновить
                </button>
            </div>

            {Object.keys(groupedMeetings).map(date => (
                <div key={date} className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 text-blue-800 rounded-full px-4 py-1.5 text-sm font-medium">
                            {new Date(date).toLocaleDateString('ru-RU', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </div>
                        <div className="ml-3 h-px bg-gray-200 flex-grow"></div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 auto-rows-auto">
                        {groupedMeetings[date].map(meeting => {
                            if (meeting && meeting.bookingId && meeting.startAt && meeting.endAt) {
                                return (
                                    <div key={meeting.bookingId} className="h-auto flex">
                                        <div className="w-full">
                                            <MeetingItem item={meeting} />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MeetingList;