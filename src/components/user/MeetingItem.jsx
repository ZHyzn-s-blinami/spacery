import QRCode from "react-qr-code"
import { useDispatch } from "react-redux";
import { cancelBooking } from "../../store/booking/thunk"

const MeetingItem = ({item, bookingId}) => {

    const dispatch = useDispatch()

    const startTime = new Date(item.startAt)
    const endTime = new Date(item.endAt)

    const handleRemove = () => {
        dispatch(cancelBooking(item.bookingId));
    }

    return (
        <div>
            <p>{item.address}</p>
            <p>{`${startTime.getHours()}:${endTime.getMinutes()}-${endTime.getHours()}:${endTime.getMinutes()}`}</p>
            <QRCode value={bookingId}/>
            <button onClick={handleRemove}>отменить</button>
        </div>
    )
}

export default MeetingItem



