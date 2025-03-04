import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserMeetings } from '../store/user/thunks';
import { MeetingsList } from '../components/user/MeetingsList';
import { Link } from 'react-router-dom';
import {
  BookKey,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from 'lucide-react';
import PageTitle from './PageTitle';

const MeetingsPage = () => {
  const dispatch = useDispatch();
  const { meetings, loading } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [visibleTab, setVisibleTab] = useState('PENDING');
  const [showLoading, setShowLoading] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const [sortedMeetings, setSortedMeetings] = useState([]);

  const tabs = [
    { id: 'PENDING', label: 'Предстоящие', icon: BookKey },
    { id: 'ACCEPTED', label: 'Подтвержденные', icon: CheckCircleIcon },
    { id: 'REJECTED', label: 'Отмененные', icon: XCircleIcon },
    { id: 'OVERDUE', label: 'Просроченные', icon: ClockIcon },
  ];

  useEffect(() => {
    dispatch(fetchUserMeetings());
    setShowLoading(loading);
  }, [dispatch]);

  useEffect(() => {
    if (!meetings || !meetings.length) return;

    const filtered = meetings.filter((meeting) => meeting?.status === visibleTab);

    const sorted = [...filtered].sort((a, b) => {
      let dateA, dateB;

      if (a.dateTime) {
        dateA = new Date(a.dateTime);
      } else if (a.date) {
        dateA = new Date(a.date + ' ' + (a.time || '00:00'));
      } else if (a.startDate) {
        dateA = new Date(a.startDate);
      } else if (a.meetingDate) {
        dateA = new Date(a.meetingDate);
      } else {
        const dateField = Object.keys(a).find((key) => key.toLowerCase().includes('date'));
        dateA = dateField ? new Date(a[dateField]) : new Date(0);
      }

      if (b.dateTime) {
        dateB = new Date(b.dateTime);
      } else if (b.date) {
        dateB = new Date(b.date + ' ' + (b.time || '00:00'));
      } else if (b.startDate) {
        dateB = new Date(b.startDate);
      } else if (b.meetingDate) {
        dateB = new Date(b.meetingDate);
      } else {
        const dateField = Object.keys(b).find((key) => key.toLowerCase().includes('date'));
        dateB = dateField ? new Date(b[dateField]) : new Date(0);
      }

      if (isNaN(dateA.getTime())) dateA = new Date(0);
      if (isNaN(dateB.getTime())) dateB = new Date(0);

      return dateA - dateB;
    });

    setSortedMeetings(sorted);
  }, [meetings, visibleTab]);

  useEffect(() => {
    if (activeTab !== visibleTab) {
      setContentVisible(false);

      const timer = setTimeout(() => {
        setVisibleTab(activeTab);

        const showTimer = setTimeout(() => {
          setContentVisible(true);
        }, 100);

        return () => clearTimeout(showTimer);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [activeTab, visibleTab]);

  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || 'Предстоящие';
  const ActiveTabIcon = tabs.find((tab) => tab.id === activeTab)?.icon || BookKey;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileDropdownOpen(false);
  };

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
    <div className="bg-gray-50 min-h-screen py-4 sm:py-8">
      <PageTitle title="Список бронирований" />
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="bg-blue-50 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center">
              <Link
                to="/profile"
                className="mr-2 sm:mr-3 p-1.5 sm:p-2 hover:bg-blue-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon size={18} className="text-gray-700 sm:hidden" />
                <ArrowLeftIcon size={20} className="text-gray-700 hidden sm:block" />
              </Link>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Мои бронирования
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="sm:hidden border-b">
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="w-full flex items-center justify-between p-4 text-left text-gray-900 font-medium"
              >
                <div className="flex items-center">
                  <ActiveTabIcon size={18} className="text-blue-600 mr-2" />
                  <span>{activeTabLabel}</span>
                </div>
                <ChevronDownIcon
                  size={18}
                  className={`text-gray-500 transition-transform ${
                    mobileDropdownOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`bg-gray-50 overflow-hidden transition-all duration-500 ease-in-out ${
                  mobileDropdownOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  if (isActive) return null;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className="w-full flex items-center p-3 pl-6 text-left text-gray-700 hover:bg-gray-100"
                    >
                      <Icon size={16} className="mr-2" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden sm:block border-b">
              <div className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-4 text-sm flex items-center whitespace-nowrap transition-colors font-medium
                                            ${
                                              isActive
                                                ? 'border-b-2 border-blue-600 text-blue-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                    >
                      <Icon size={18} className="mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`transition-all duration-500 ease-in-out p-3 sm:p-6 ${
                contentVisible
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform translate-y-4'
              }`}
            >
              {activeTab === visibleTab || contentVisible ? (
                <MeetingsList
                  statusFilter={visibleTab}
                  key={visibleTab}
                  meetings={sortedMeetings}
                />
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
