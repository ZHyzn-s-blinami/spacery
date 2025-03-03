import React, {useState, useEffect, useRef} from "react";
import QRCode from "react-qr-code";
import {useDispatch, useSelector} from "react-redux";
import {cancelUserMeeting} from "../../store/user/thunks";
import {fetchUserMeetings} from "../../store/user/thunks";
import {updateMeeting} from "../../store/booking/thunks"
import {fetchQrCode} from "../../store/user/thunks";
import {
    ClockIcon,
    MapPinIcon,
    CalendarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    AlertCircleIcon,
    XIcon,
    RefreshCwIcon,
    CalendarDaysIcon, CheckCircleIcon
} from "lucide-react";
import TimeRangeSlider from "../../components/TimeRangeSlider";
import axios from "axios";


const MeetingItem = ({item}) => {
    console.log("meeting item", item);
    console.log(item.bookingId)
    if (!item || !item.startAt || !item.endAt) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-center">
                <p className="text-gray-500">Информация о бронировании недоступна</p>
            </div>
        );
    }

    const dispatch = useDispatch();
    const [qrCode, setQrCode] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isRescheduleModalClosing, setIsRescheduleModalClosing] = useState(false);
    const [isCancelModalClosing, setIsCancelModalClosing] = useState(false);
    const [rescheduleModalMounted, setRescheduleModalMounted] = useState(false);
    const [cancelModalMounted, setCancelModalMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date(item.startAt).toISOString().split('T')[0]);
    const [selectedTimeRange, setSelectedTimeRange] = useState({
        start: new Date(item.startAt),
        end: new Date(item.endAt)
    });
    const [rescheduleStatus, setRescheduleStatus] = useState(null);
    const [reschedulingLoading, setReschedulingLoading] = useState(false);

    const startTime = new Date(item.startAt);
    const endTime = new Date(item.endAt);

    // Add after other useState declarations
    const [showQrModal, setShowQrModal] = useState(false);
    const [isQrModalClosing, setIsQrModalClosing] = useState(false);
    const [qrModalMounted, setQrModalMounted] = useState(false);

    // Add after time formatting and before other functions
    const shouldShowQr = () => {
        const now = new Date();
        const diffMs = startTime - now;
        const diffMinutes = diffMs / (1000 * 60);
        return diffMinutes <= 5 && item.status === "PENDING"; // Show QR if less than 5 minutes until start
    };

    // Add after other modal control functions
    const openQrModal = () => {
        if (shouldShowQr() && qrCode) {
            setShowQrModal(true);
            setIsQrModalClosing(false);
        }
    };

    const closeQrModal = () => {
        setIsQrModalClosing(true);
        setTimeout(() => {
            setShowQrModal(false);
            setIsQrModalClosing(false);
        }, 300);
    };

    // Add with other useEffect hooks
    useEffect(() => {
        if (showQrModal && !isQrModalClosing) {
            const timer = setTimeout(() => {
                setQrModalMounted(true);
            }, 10);
            return () => clearTimeout(timer);
        }
        if (!showQrModal) {
            setQrModalMounted(false);
        }
    }, [showQrModal, isQrModalClosing]);

    useEffect(() => {
        const getQrCode = async () => {
            // Only fetch QR code if we should show it
            if (shouldShowQr() && item.bookingId && item.status == "PENDING") {
                try {
                    console.log("bookingid", item.bookingId);
                    console.log("bookingid", item.bookingId);
                    const response = await dispatch(fetchQrCode(item.bookingId));
                    console.log("payload", response)
                    setQrCode(typeof response === "string" ? response :
                        "https://prod-team-5-qnkvbg7c.final.prodcontest.ru/checkQr/" + response.payload.qrCode
                        || "");
                } catch (error) {
                    console.error("Ошибка при получении QR-кода:", error);
                    setQrCode("");
                }
            }
        };

        // Set an interval to check if we should show QR code
        const interval = setInterval(() => {
            if (shouldShowQr() && !qrCode && item.bookingId) {
                getQrCode();
            }
        }, 1000000); // Check every 10 seconds

        // Initial check
        getQrCode();

        return () => clearInterval(interval);
    }, [dispatch, item.bookingId]);

    useEffect(() => {
        if (showRescheduleModal && !isRescheduleModalClosing) {
            const timer = setTimeout(() => {
                setRescheduleModalMounted(true);
            }, 10);
            return () => clearTimeout(timer);
        }
        if (!showRescheduleModal) {
            setRescheduleModalMounted(false);
        }
    }, [showRescheduleModal, isRescheduleModalClosing]);

    const [timeSliderState, setTimeSliderState] = useState({
        startTime: {
            hour: selectedTimeRange.start.getHours(),
            minute: selectedTimeRange.start.getMinutes()
        },
        endTime: {
            hour: selectedTimeRange.end.getHours(),
            minute: selectedTimeRange.end.getMinutes()
        }
    });

    const handleStartTimeChange = (newStartTime) => {
        setTimeSliderState(prev => ({
            ...prev,
            startTime: newStartTime
        }));

        const newDate = new Date(selectedDate);
        newDate.setHours(newStartTime.hour, newStartTime.minute, 0, 0);
        setSelectedTimeRange(prev => ({
            ...prev,
            start: newDate
        }));
    };

    const handleEndTimeChange = (newEndTime) => {
        setTimeSliderState(prev => ({
            ...prev,
            endTime: newEndTime
        }));

        const newDate = new Date(selectedDate);
        newDate.setHours(newEndTime.hour, newEndTime.minute, 0, 0);
        setSelectedTimeRange(prev => ({
            ...prev,
            end: newDate
        }));
    };


    useEffect(() => {
        if (showCancelModal && !isCancelModalClosing) {
            const timer = setTimeout(() => {
                setCancelModalMounted(true);
            }, 10);
            return () => clearTimeout(timer);
        }
        if (!showCancelModal) {
            setCancelModalMounted(false);
        }
    }, [showCancelModal, isCancelModalClosing]);

    useEffect(() => {
        const fetchUnavailableSlots = async () => {
            setTimeout(() => {
                const newStartDate = new Date(selectedDate);
                newStartDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

                const newEndDate = new Date(selectedDate);
                newEndDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

                setSelectedTimeRange({
                    start: newStartDate,
                    end: newEndDate
                });
            }, 300);
        };

        fetchUnavailableSlots();
    }, [selectedDate]);

    const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const getTimeUntilMeeting = () => {
        const now = new Date();
        const diff = startTime - now;

        if (diff <= 0) return "Сейчас";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `через ${days} ${getDayText(days)}`;
        if (hours > 0) return `через ${hours} ${getHourText(hours)}`;
        return `через ${minutes} ${getMinuteText(minutes)}`;
    };

    const getDayText = (days) => {
        if (days === 1) return "день";
        if (days >= 2 && days <= 4) return "дня";
        return "дней";
    };

    const getHourText = (hours) => {
        if (hours === 1) return "час";
        if (hours >= 2 && hours <= 4) return "часа";
        return "часов";
    };

    const getMinuteText = (minutes) => {
        if (minutes === 1) return "минуту";
        if (minutes >= 2 && minutes <= 4) return "минуты";
        return "минут";
    };

    const handleRemove = () => {
        setShowCancelModal(true);
        setIsCancelModalClosing(false);
    };

    const closeCancelModal = () => {
        setIsCancelModalClosing(true);
        setTimeout(() => {
            setShowCancelModal(false);
            setIsCancelModalClosing(false);
        }, 300);
    };

    const confirmCancellation = async () => {
        try {
            dispatch(cancelUserMeeting(item.bookingId));
            closeCancelModal();
        } catch (error) {
            console.error("Ошибка при удалении брони:", error);
        }
    };

    const handleReschedule = () => {
        setShowRescheduleModal(true);
        setIsRescheduleModalClosing(false);
    };

    const closeRescheduleModal = () => {
        setIsRescheduleModalClosing(true);
        setTimeout(() => {
            setShowRescheduleModal(false);
            setIsRescheduleModalClosing(false);
        }, 300);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const confirmReschedule = async () => {
        setReschedulingLoading(true);
        setRescheduleStatus(null);

        // Сюда ваши запросики кароч
        try {
            const formattedStartAt = selectedTimeRange.start.toISOString().split('.')[0];
            const formattedEndAt = selectedTimeRange.end.toISOString().split('.')[0];

            await dispatch(updateMeeting({
                uuid: item.bookingId,
                startAt: formattedStartAt,
                endAt: formattedEndAt
            })).unwrap();

            const meetingsResponse = await dispatch(fetchUserMeetings()).unwrap();
            console.log("Обновленные брони:", meetingsResponse);

            setRescheduleStatus("success");


            setTimeout(() => {
                closeRescheduleModal();
            }, 2000);

        } catch (error) {
            console.error("Ошибка при переносе брони:", error);
            setRescheduleStatus("error");

            // сообщение об ошибке
            setTimeout(() => {

                setRescheduleStatus(null);
            }, 3000);
        } finally {
            setReschedulingLoading(false);
        }
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const [predefinedDescriptions, setPredefinedDescriptions] = useState([]);

    // Add these state variables alongside your other state declarations
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [isTicketModalClosing, setIsTicketModalClosing] = useState(false);
    const [ticketModalMounted, setTicketModalMounted] = useState(false);
    const [ticketData, setTicketData] = useState({
        placeName: item.place.name || '',
        ticketType: 'CLEANING',
        description: ''
    });
    const [ticketStatus, setTicketStatus] = useState(null);
    const [ticketSubmitting, setTicketSubmitting] = useState(false);

// Add this function to handle opening/closing the ticket modal
    const openTicketModal = () => {
        setShowTicketModal(true);
        setIsTicketModalClosing(false);
    };

    const closeTicketModal = () => {
        setIsTicketModalClosing(true);
        setTimeout(() => {
            setShowTicketModal(false);
            setIsTicketModalClosing(false);
        }, 300);
    };

// Add this function to handle form submission
    const submitTicket = async () => {
        setTicketSubmitting(true);
        setTicketStatus(null);

        try {
            const finalDescription = ticketData.ticketType === "OTHER"
                ? ticketData.description
                : selectedIssue;

            const token = localStorage.getItem('userToken');

            const response = await axios.post('https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/tickets/create',
                {
                    placeName: ticketData.placeName,
                    ticketType: ticketData.ticketType,
                    description: finalDescription
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            );

            // Axios success - no need to check response.ok
            setTicketStatus('success');
            setTimeout(() => {
                closeTicketModal();
                setTicketData({...ticketData, description: ''});
                setSelectedIssue(null);
            }, 1500);
        } catch (error) {
            console.error('Ошибка:', error);
            setTicketStatus('error');
        } finally {
            setTicketSubmitting(false);
        }
    };

// Add this useEffect to handle modal animation
    useEffect(() => {
        if (showTicketModal && !isTicketModalClosing) {
            const timer = setTimeout(() => {
                setTicketModalMounted(true);
            }, 10);
            return () => clearTimeout(timer);
        }
        if (!showTicketModal) {
            setTicketModalMounted(false);
        }
    }, [showTicketModal, isTicketModalClosing]);

    const getStatusBadge = () => {
        switch (item.status) {
            case "REJECTED":
                return (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-red-100 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-red-600">Отменено</span>
                    </div>
                );
            case "ACCEPTED":
                return (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-green-600">Подтверждено</span>
                    </div>
                );
            case "OVERDUE":
                return (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                        </span>
                        <span className="text-gray-600">Просрочено</span>
                    </div>
                );
            case "PENDING":
                return (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-blue-600">Ожидается</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-blue-600">Ожидается</span>
                    </div>
                );
        }
    };
    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Add these state variables alongside your other ticket-related states
    const [selectedIssue, setSelectedIssue] = useState(null);

// Modify the useEffect for ticket type changes to reset selection
    useEffect(() => {
        switch (ticketData.ticketType) {
            case "CLEANING":
                setPredefinedDescriptions([
                    "Не убрано помещение",
                    "Разлита жидкость",
                    "Грязные окна/поверхности",
                    "Неприятный запах"
                ]);
                break;
            case "TECHNICAL_PROBLEM":
                setPredefinedDescriptions([
                    "Не работает проектор",
                    "Проблемы с микрофоном",
                    "Нет подключения к сети",
                    "Неисправна мебель"
                ]);
                break;
            case "PLACE_TAKEN":
                setPredefinedDescriptions([
                    "Место занято"
                ]);
                break;
            case "FOOD":
                setPredefinedDescriptions([
                    "Не хватает еды",
                    "Не хватает напитков",
                    "Не хватает посуды",
                    "Не хватает столовых приборов"
                ]);
                break;

            default:
                setPredefinedDescriptions([]);
        }
        // Reset selected issue when changing type
        setSelectedIssue(null);
    }, [ticketData.ticketType]);


// Add this to handle scroll locking
    useEffect(() => {
        if (showTicketModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showTicketModal]);

    // Add this useEffect to clear description when changing from OTHER to another type
    useEffect(() => {
        if (ticketData.ticketType !== "OTHER") {
            setTicketData(prev => ({...prev, description: ''}));
        }
    }, [ticketData.ticketType]);

    console.log(item.place.description, item.place.name)

    return (
        <div
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-1 text-lg">{item.address}</h4>
                        <div className="flex items-center text-gray-600 mb-2">
                            <ClockIcon size={16} className="mr-2 text-gray-400"/>
                            <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                        </div>
                        {getStatusBadge()}
                    </div>
                    <div>
                        <div className="text-gray-500 mb-1">{`Место: ${item.place.name}`}</div>
                        <div className="font-medium">{item.address}</div>
                    </div>
                    <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        {getTimeUntilMeeting()}
                    </div>
                    {/*!!!!!!*/}
                </div>


                {item.status === "PENDING" || (new Date(item.startAt) <= new Date() && new Date() <= new Date(item.endAt)) ? (
                    <div className="flex">
                        <button
                            onClick={toggleDetails}
                            className="flex-1 flex items-center justify-center text-blue-600 hover:text-blue-800 text-sm py-2 mt-2 border-t border-gray-100 transition-all duration-200 hover:bg-blue-50"
                        >
                            <div className="flex items-center transition-transform duration-300 ease-in-out">
                                {showDetails ? (
                                    <>
                                        <ChevronUpIcon size={16} className="mr-1 transition-transform duration-300"/>
                                        <span className="transition-all duration-200">Скрыть детали</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronDownIcon size={16} className="mr-1 transition-transform duration-300"/>
                                        <span className="transition-all duration-200">Показать QR-код</span>
                                    </>
                                )}
                            </div>
                        </button>
                        <button
                            onClick={openTicketModal}
                            className="flex-1 flex items-center justify-center text-blue-600 hover:text-blue-800 text-sm py-2 mt-2 border-t border-l border-gray-100 transition-all duration-200 hover:bg-blue-50"
                        >
                            <div className="flex items-center">
                                <AlertCircleIcon size={16} className="mr-1"/>
                                <span>Сообщить о проблеме</span>
                            </div>
                        </button>
                    </div>
                ) : <></>}
            </div>

            <div
                className={`bg-gray-50 border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${showDetails ? 'max-h-[2000px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
                }`}
            >
                <div className={`bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-center transition-all duration-300 ease-in-out 
                ${showDetails ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}
                     style={{
                         transitionDelay: showDetails ? '0.1s' : '0s'
                     }}
                >
                    <div className="text-center">
                        <div className="mb-3">
    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
      QR-код для входа
    </span>
                        </div>
                        <div className="relative">
                            {shouldShowQr() ? (
                                <div
                                    className="bg-white inline-block p-3 rounded-md border-2 border-dotted border-gray-200 cursor-pointer hover:shadow-md transition-all"
                                    onClick={openQrModal}
                                    title="Нажмите, чтобы увеличить QR-код"
                                >
                                    <QRCode value={qrCode} size={120}/>
                                </div>
                            ) : (
                                <div
                                    className="inline-block p-3 rounded-md border-2 border-dotted border-gray-200 relative">
                                    {/* Blurred placeholder QR code */}
                                    <div className="filter blur-md opacity-50">
                                        <QRCode value="placeholder-qr-value" size={120}/>
                                    </div>

                                    <div
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-70 rounded-md">
                                        {item.status === "PENDING" && (
                                            <>
                                                <ClockIcon size={30} className="text-gray-500 mb-2"/>
                                                <p className="text-xs font-medium text-gray-600 px-2 text-center">
                                                    QR-код будет доступен за 5 минут до начала
                                                </p>
                                            </>
                                        )}

                                        {item.status === "ACCEPTED" && (
                                            <>
                                                <CheckCircleIcon size={30} className="text-green-500 mb-2"/>
                                                <p className="text-xs font-medium text-green-600 px-2 text-center">
                                                    Бронирование подтверждено
                                                </p>
                                            </>
                                        )}

                                        {item.status === "REJECTED" && (
                                            <>
                                                <XIcon size={30} className="text-red-500 mb-2"/>
                                                <p className="text-xs font-medium text-red-600 px-2 text-center">
                                                    Бронирование отменено
                                                </p>
                                            </>
                                        )}

                                        {item.status === "OVERDUE" && (
                                            <>
                                                <AlertCircleIcon size={30} className="text-gray-500 mb-2"/>
                                                <p className="text-xs font-medium text-gray-600 px-2 text-center">
                                                    Время бронирования истекло
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-2 text-xs text-gray-500">
                                {shouldShowQr()
                                    ? "Покажите этот код при входе (нажмите для увеличения)"
                                    : `Доступно ${getTimeUntilMeeting()}`
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col sm:flex-row gap-2 transition-all duration-300 ease-in-out
                ${showDetails ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}
                     style={{
                         transitionDelay: showDetails ? '0.15s' : '0s'
                     }}
                >
                    <button
                        onClick={handleReschedule}
                        className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                    >
                        <RefreshCwIcon size={16} className="mr-2 transition-transform duration-300 hover:rotate-180"/>
                        Перенести
                    </button>
                    <button
                        onClick={handleRemove}
                        className="flex-1 bg-white border border-red-600 text-red-600 hover:bg-red-50 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                    >
                        <XIcon size={16} className="mr-2 transition-transform duration-300 hover:rotate-90"/>
                        Отменить
                    </button>
                </div>
            </div>

            {showQrModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out">
                    <div
                        className="absolute inset-0 bg-black transition-all duration-300 ease-in-out"
                        style={{
                            opacity: qrModalMounted && !isQrModalClosing ? 0.8 : 0,
                        }}
                        onClick={closeQrModal}
                    ></div>
                    <div
                        className={`relative bg-white rounded-xl shadow-xl max-w-md w-full p-8 z-50 transition-all duration-300 text-center ${
                            isQrModalClosing
                                ? 'opacity-0 transform scale-95'
                                : qrModalMounted
                                    ? 'opacity-100 transform scale-100'
                                    : 'opacity-0 transform scale-95'
                        }`}
                    >
                        <button
                            onClick={closeQrModal}
                            className="absolute top-4 right-4 rounded-full p-2 hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <XIcon size={24}/>
                        </button>

                        <h3 className="text-xl font-medium text-gray-800 mb-6">QR-код для входа</h3>

                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-4 rounded-md border-2 border-gray-200">
                                <QRCode value={qrCode} size={250}/>
                            </div>
                        </div>

                        <p className="text-gray-600">
                            Предъявите этот QR-код при входе
                        </p>
                    </div>
                </div>
            )}

            {showRescheduleModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out">
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-in-out"
                        style={{
                            backdropFilter: rescheduleModalMounted && !isRescheduleModalClosing ? 'blur(5px)' : 'blur(0px)',
                            backgroundColor: rescheduleModalMounted && !isRescheduleModalClosing ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)',
                        }}
                        onClick={closeRescheduleModal}
                    ></div>
                    <div
                        className={`relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto z-50 transition-all duration-300 ${isRescheduleModalClosing
                            ? 'opacity-0 transform scale-95'
                            : rescheduleModalMounted
                                ? 'opacity-100 transform scale-100'
                                : 'opacity-0 transform scale-95'
                        }`}
                    >
                        <div
                            className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium">Изменить время брони</h3>
                            <button
                                onClick={closeRescheduleModal}
                                className="rounded-full p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <XIcon size={20}/>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                                    <div className="flex">
                                        <AlertCircleIcon size={20} className="text-blue-500 mr-2 flex-shrink-0"/>
                                        <div>
                                            <p className="text-sm text-blue-700">
                                                Выберите новую дату и время для вашей брони
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center text-gray-700 font-medium mb-4">
                                            <CalendarDaysIcon size={18} className="mr-2 text-blue-600"/>
                                            <h4>Выберите дату</h4>
                                        </div>
                                        <input
                                            type="date"
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Выбрано: <span
                                            className="font-medium">{formatDateForDisplay(selectedDate)}</span>
                                        </p>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center text-gray-700 font-medium mb-4">
                                            <ClockIcon size={18} className="mr-2 text-blue-600"/>
                                            <h4>Выберите время брони</h4>
                                        </div>

                                        <TimeRangeSlider
                                            startTime={timeSliderState.startTime}
                                            endTime={timeSliderState.endTime}
                                            onStartTimeChange={handleStartTimeChange}
                                            onEndTimeChange={handleEndTimeChange}
                                            minTime={{hour: 8, minute: 0}}
                                            maxTime={{hour: 22, minute: 0}}
                                            currentTime={new Date()}
                                            isToday={selectedDate === new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                                    <div className="flex items-start">
                                        <MapPinIcon size={18} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0"/>
                                        <p className="text-sm text-yellow-700">
                                            Место бронирования останется прежним: <span
                                            className="font-medium">{item.address}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    onClick={closeRescheduleModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                                    disabled={reschedulingLoading}
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={confirmReschedule}
                                    disabled={reschedulingLoading}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 relative ${rescheduleStatus === 'success'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : rescheduleStatus === 'error'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                                >
                                    <div className="relative flex items-center justify-center">
                                        <span
                                            className={`transition-all duration-300 ${reschedulingLoading || rescheduleStatus ? 'opacity-0' : 'opacity-100'}`}>
                                            Подтвердить
                                        </span>

                                        <div
                                            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${reschedulingLoading ? 'opacity-100' : 'opacity-0'}`}>
                                            <svg className="animate-spin h-5 w-5 mr-2"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Обработка...</span>
                                        </div>

                                        <div
                                            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${!reschedulingLoading && rescheduleStatus === 'success' ? 'opacity-100' : 'opacity-0'}`}>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <span>Успешно</span>
                                        </div>

                                        <div
                                            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${!reschedulingLoading && rescheduleStatus === 'error' ? 'opacity-100' : 'opacity-0'}`}>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            <span>Ошибка</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Modal */}
            {showTicketModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out">
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-in-out"
                        style={{
                            backdropFilter: ticketModalMounted && !isTicketModalClosing ? 'blur(5px)' : 'blur(0px)',
                            backgroundColor: ticketModalMounted && !isTicketModalClosing ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
                        }}
                        onClick={closeTicketModal}
                    ></div>
                    <div
                        className={`relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-50 transition-all duration-300 ${
                            isTicketModalClosing
                                ? 'opacity-0 transform scale-95'
                                : ticketModalMounted
                                    ? 'opacity-100 transform scale-100'
                                    : 'opacity-0 transform scale-95'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-800 flex items-center">
                                <AlertCircleIcon size={20} className="mr-2 text-gray-700"/>
                                Сообщить о проблеме
                            </h3>
                            <button
                                onClick={closeTicketModal}
                                className="rounded-full p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <XIcon size={20}/>
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Тип проблемы</label>
                            <select
                                value={ticketData.ticketType}
                                onChange={(e) => setTicketData({...ticketData, ticketType: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="CLEANING">Уборка</option>
                                <option value="TECHNICAL_PROBLEM">Оборудование</option>
                                <option value="PLACE_TAKEN">Место занято</option>
                                <option value="FOOD">Еда</option>
                                <option value="OTHER">Другое</option>
                            </select>
                        </div>

                        {ticketData.ticketType !== "OTHER" ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Выберите
                                    проблему</label>
                                <div className="space-y-2">
                                    {predefinedDescriptions.map((desc, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedIssue(desc)}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                                selectedIssue === desc
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                            }`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                                                    selectedIssue === desc
                                                        ? 'border-blue-500 bg-white'
                                                        : 'border-gray-400'
                                                }`}>
                                                {selectedIssue === desc && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                )}
                                            </div>
                                            <span
                                                className={`text-sm ${selectedIssue === desc ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
            {desc}
          </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Описание
                                    проблемы</label>
                                <textarea
                                    value={ticketData.description}
                                    onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                                    rows="4"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Опишите проблему подробнее..."
                                ></textarea>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={closeTicketModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                disabled={ticketSubmitting}
                            >
                                Отмена
                            </button>
                            <button
                                onClick={submitTicket}
                                disabled={
                                    ticketSubmitting ||
                                    (ticketData.ticketType === "OTHER" ? !ticketData.description.trim() : !selectedIssue)
                                }
                                className={`px-6 py-2 rounded-lg transition-all duration-300 relative ${
                                    ticketStatus === 'success'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : ticketStatus === 'error'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                            >
                                <div className="relative flex items-center justify-center">
                                    <span
                                        className={`transition-all duration-300 ${ticketSubmitting || ticketStatus ? 'opacity-0' : 'opacity-100'}`}>
                                      Отправить
                                    </span>

                                    <div
                                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${ticketSubmitting ? 'opacity-100' : 'opacity-0'}`}>
                                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg"
                                             fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Отправка...</span>
                                    </div>

                                    <div
                                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${!ticketSubmitting && ticketStatus === 'success' ? 'opacity-100' : 'opacity-0'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span>Отправлено</span>
                                    </div>

                                    <div
                                        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${!ticketSubmitting && ticketStatus === 'error' ? 'opacity-100' : 'opacity-0'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                        <span>Ошибка</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out">
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-in-out"
                        style={{
                            backdropFilter: cancelModalMounted && !isCancelModalClosing ? 'blur(5px)' : 'blur(0px)',
                            backgroundColor: cancelModalMounted && !isCancelModalClosing ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)',
                        }}
                        onClick={closeCancelModal}
                    ></div>
                    <div
                        className={`relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-50 transition-all duration-300 ${isCancelModalClosing
                            ? 'opacity-0 transform scale-95'
                            : cancelModalMounted
                                ? 'opacity-100 transform scale-100'
                                : 'opacity-0 transform scale-95'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-800 flex items-center">
                                <AlertCircleIcon size={20} className="mr-2 text-gray-700"/>
                                Подтверждение отмены
                            </h3>
                            <button
                                onClick={closeCancelModal}
                                className="rounded-full p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                                <XIcon size={20}/>
                            </button>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                            <p className="text-lg mb-2 text-center font-medium text-gray-700">
                                Вы уверены, что хотите отменить бронь?
                            </p>
                            <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex">
                                    <MapPinIcon size={16} className="mr-2 flex-shrink-0 text-gray-500"/>
                                    <span>{`${item.place.description} - ${item.place.name}`}</span> {/*!!!!*/}
                                </div>
                                <div className="flex">
                                    <CalendarIcon size={16} className="mr-2 flex-shrink-0 text-gray-500"/>
                                    <span>{startTime.toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long'
                                    })}</span>
                                </div>
                                <div className="flex">
                                    <ClockIcon size={16} className="mr-2 flex-shrink-0 text-gray-500"/>
                                    <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between space-x-4">
                            <button
                                onClick={closeCancelModal}
                                className="flex-1 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Нет, оставить
                            </button>
                            <button
                                onClick={confirmCancellation}
                                className="flex-1 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Да, отменить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingItem;