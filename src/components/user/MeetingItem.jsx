import QRCode from "react-qr-code"

const MeetingItem = ({item}) => {

    const startTime = new Date(item.startAt)
    const endTime = new Date(item.endAt)

    const handleRemove = () => {
        console.log('deleted')
    }

    console.log(startTime.getHours())
    return (
        <div>
            <p>{item.address}</p>
            <p>{`${startTime.getHours()}:${endTime.getMinutes()}-${endTime.getHours()}:${endTime.getMinutes()}`}</p>
            <QRCode value={item.qr}/>
            <button onClick={handleRemove}>отменить</button>
        </div>
    )
}

export default MeetingItem