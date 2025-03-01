const MeetingItem = ({item}) => {
    return (
        <div>
            <p>{item.address}</p>
            <p>{item.time}</p>
            <button>отменить</button>
        </div>
    )
}

export default MeetingItem