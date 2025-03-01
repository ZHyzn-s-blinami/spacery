import { useEffect } from 'react';
import QRCode from 'react-qr-code';
import { fetchUserMeetings } from '../../store/user/thunks';

const MeetingItem = ({ item, bookingId }) => {
  const startTime = new Date(item.startAt);
  const endTime = new Date(item.endAt);

  const handleRemove = () => {
    console.log('deleted');
  };

  console.log(startTime.getHours());
  return (
    <div>
      <p>{item.address}</p>
      <p>{`${startTime.getHours()}:${endTime.getMinutes()}-${endTime.getHours()}:${endTime.getMinutes()}`}</p>
      <QRCode value={bookingId} />
      <button onClick={handleRemove}>отменить</button>
    </div>
  );
};

export default MeetingItem;
