import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserMeetings } from "../../store/user/thunks";
import MeetingItem from "./MeetingItem";

const MeetingList = () => {
  const dispatch = useDispatch();
  const meetings = useSelector(state => state.booking.meetings);
  const loading = useSelector(state => state.booking.loading);
  const error = useSelector(state => state.booking.error);

  useEffect(() => {
    dispatch(fetchUserMeetings());
  }, [dispatch]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div>
      {meetings.map((item) => (
        item.status === "PENDING" && (
          <MeetingItem key={item.bookingId} item={item} />
        )
      ))}
    </div>
  );
};

export default MeetingList;