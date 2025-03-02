import QRCode from "react-qr-code"
import { fetchUserMeetings } from "../../store/user/thunks";
const MeetingItem = ({ item, handleRemove}) => {


    const startTime = new Date(item.startAt)
    const endTime = new Date(item.endAt)

    // const handleRemove = async () => {
    //     const response = await bookingService.cancelBooking(item.bookingId);
    //     console.log(response)
    //     if (response) {
    //         const meetings = await fetchUserMeetings();
    //         localStorage.setItem('userMeetings', JSON.stringify(meetings))

    //     }
    // }

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