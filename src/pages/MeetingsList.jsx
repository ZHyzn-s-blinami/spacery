import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchUserMeetings} from '../store/user/thunks';
import MeetingList from '../components/user/MeetingsList';
import {Link} from 'react-router-dom';
import {BookKey, CheckCircleIcon, XCircleIcon, ClockIcon, ArrowLeftIcon} from 'lucide-react';

const MeetingsPage = () => {
    const dispatch = useDispatch();
    const {meetings, loading} = useSelector((state) => state.user);
    const [activeTab, setActiveTab] = useState('PENDING');
    const [showLoading, setShowLoading] = useState(false);

    const tabs = [
        {id: 'PENDING', label: 'Предстоящие', icon: BookKey},
        {id: 'ACCEPTED', label: 'Подтвержденные', icon: CheckCircleIcon},
        {id: 'REJECTED', label: 'Отмененные', icon: XCircleIcon},
        {id: 'OVERDUE', label: 'Просроченные', icon: ClockIcon},
    ];

    useEffect(() => {
        dispatch(fetchUserMeetings());
        setShowLoading(loading);
    }, [dispatch]);

    // Filter meetings by the active tab
    const filteredMeetings = meetings?.filter(meeting =>
        meeting?.status === activeTab
    ) || [];

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
                <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <Link to="/profile" className="mr-3 p-2 hover:bg-blue-100 rounded-full transition-colors">
                                <ArrowLeftIcon size={20} className="text-gray-700"/>
                            </Link>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Мои бронирования</h1>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b px-4 overflow-x-auto">
                            <div className="flex space-x-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-4 px-4 text-sm flex items-center whitespace-nowrap transition-colors font-medium
                                                                            ${isActive
                                                ? 'border-b-2 border-blue-600 text-blue-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }
                                                                        `}
                                        >
                                            <Icon size={18} className="mr-2"/>
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6">
                            <MeetingList
                                statusFilter={activeTab}
                                key={activeTab}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingsPage;