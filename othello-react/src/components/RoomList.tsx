import React from 'react'

type Props = {
    roomList: Array<string>
    joinRoom: Function
}

const RoomList: React.FC<Props> = ({ roomList, joinRoom }) => {
    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            {roomList.map((roomName) => (
                <>
                    <h1>{roomName}</h1>
                    <button onClick={(e) => {joinRoom(e, roomName)}}>JOIN</button>
                </>                   
            ))}
        </div>
    )
}

export default RoomList
