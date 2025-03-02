import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bookingService } from "../../services/bookingService";

import MeetingItem from "./MeetingItem";
import { fetchUserMeetings } from "../../store/user/thunks";

const MeetingList = ({ booking }) => {
  const meetings = useSelector(state => state.booking.meetings)
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserMeetings());
  }, [dispatch, meetings]);

  const handleRemove = async (bookingId) => {
    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response) {
        await dispatch(fetchUserMeetings());
      }
    } catch (error) {
      console.error("Ошибка при удалении брони:", error);
    }
  };

  return (
    <div>
      {booking.map((item) => {
        if (item.status == 'PENDING') {
          return <MeetingItem key={item.bookingId} item={item} handleRemove={handleRemove} />

        }

      }
      )}
    </div>
  );
};

export default MeetingList;

