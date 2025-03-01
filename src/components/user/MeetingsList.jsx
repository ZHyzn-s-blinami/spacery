import MeetingItem from "./MeetingItem"

const meetings = [
    {
        placeId: '1',
        address: 'ГРузинский вал 7',
        startAt: "2025-03-01T08:18:26.887Z",
        endAt: "2025-03-01T08:18:26.887Z",
        qr: 'google.com'
    },
    {
        placeId: '2',
        address: 'Бутырский вал 10',
        startAt: "2025-03-01T08:18:26.887Z",
        endAt: "2025-03-01T08:18:26.887Z",
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
