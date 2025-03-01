import MeetingItem from "./MeetingItem"

const meetings = [
    {   
        placeId: '1',
        time: '15:00',
        qr: 'google.com'
    },
    {
        placeId: '2',
        time: '12:00',
        qr: 'ya.ru',
    },
]

const MeetingList = () => {

    return (
        <div>
            {meetings.map(item => (
                <MeetingItem key={item.placeId} item={item} />
            ))}
        </div>
    )
}

export default MeetingList
