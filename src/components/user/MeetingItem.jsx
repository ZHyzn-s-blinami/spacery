import QRCode from "react-qr-code"

const MeetingItem = ({item}) => {
    return (
        <div>
            <p>{item.address}</p>
            <p>{item.time}</p>
            <QRCode value={item.qr}/>
            <button>отменить</button>
        </div>
    )
}

export default MeetingItem