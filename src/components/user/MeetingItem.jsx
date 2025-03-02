import QRCode from "react-qr-code"
import { useDispatch, useSelector } from "react-redux";
import { cancelUserMeeting } from "../../store/user/thunks";

const MeetingItem = ({ item }) => {
    const dispatch = useDispatch();
    const startTime = new Date(item.startAt)
    const endTime = new Date(item.endAt)

    const handleRemove = async (bookingId) => {
        try {
          dispatch(cancelUserMeeting(bookingId));
          
        } catch (error) {
          console.error("Ошибка при удалении брони:", error);
        }
      };

      const handleReshedule = () => {

      }

    return (
        <div>
            <p>{item.address}</p>
            <p>{`${startTime.getHours()}:${endTime.getMinutes()}-${endTime.getHours()}:${endTime.getMinutes()}`}</p>
            <QRCode value={item.bookingId} />
            <button>перенести</button>
            <button onClick={() => handleRemove(item.bookingId)}>отменить</button>
        </div>
    )
}

export default MeetingItem;
