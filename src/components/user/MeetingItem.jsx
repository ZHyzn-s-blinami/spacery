import QRCode from "react-qr-code"
import { useDispatch, useSelector } from "react-redux";
import { fetchUserMeetings } from "../../store/user/thunks";
import { bookingService } from "../../services/bookingService";
const MeetingItem = ({ item }) => {
    const dispatch = useDispatch();
    const startTime = new Date(item.startAt)
    const endTime = new Date(item.endAt)

    const handleRemove = async (bookingId) => {
        try {
          const response = await bookingService.cancelBooking(bookingId);
          
          dispatch(fetchUserMeetings());
          
        } catch (error) {
          console.error("Ошибка при удалении брони:", error);
        }
      };

    return (
        <div>
            <p>{item.address}</p>
            <p>{`${startTime.getHours()}:${endTime.getMinutes()}-${endTime.getHours()}:${endTime.getMinutes()}`}</p>
            <QRCode value={item.bookingId} />
            <button onClick={() => handleRemove(item.bookingId)}>отменить</button>
        </div>
    )
}

export default MeetingItem;