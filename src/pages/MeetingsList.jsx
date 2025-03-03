import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchUserMeetings} from '../store/user/thunks';
import MeetingList from '../components/user/MeetingsList';
import {Link} from 'react-router-dom';
import {CalendarIcon, UserIcon, ArrowLeftIcon} from 'lucide-react';

const MeetingsPage = () => {
    const dispatch = useDispatch();
    const {meetings, loading} = useSelector((state) => state.user);
    useEffect(() => {
        dispatch(fetchUserMeetings());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-300 mb-4"></div>
                    <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 w-32 bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Container with visible boundary - using light blue background */}
                <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-100">
                    {/* Header with back navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <Link to="/profile" className="mr-3 p-2 hover:bg-blue-100 rounded-full transition-colors">
                                <ArrowLeftIcon size={20} className="text-gray-700"/>
                            </Link>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Мои встречи</h1>
                        </div>
                    </div>

                    {/* Meetings card */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b px-6">
                            <div className="flex -mb-px">
                                <div
                                    className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm flex items-center">
                                    <CalendarIcon size={18} className="mr-2"/>
                                    Предстоящие встречи
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <MeetingList/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MeetingsPage;