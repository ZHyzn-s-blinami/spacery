import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MeetingItem from "./MeetingItem";
import { fetchUserMeetings } from "../../store/user/thunks";

const MeetingList = ({booking}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserMeetings());
  }, [dispatch]);

  console.log(booking)

  return (
    <div>
      {booking.map((item) => (
        <MeetingItem key={item.bookingId} item={item} bookingId={item.bookingId}/>
      ))}
    </div>
  );
};

export default MeetingList;

