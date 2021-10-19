import React, {useRef, useContext} from 'react'
import gameContext from '../gameContext';

type Props = {
    roomList: Array<string>
    joinRoom: Function
}

const RoomList: React.FC<Props> = ({ roomList, joinRoom }) => {
    const roomNameRef = useRef(null);
    const { setRoomName } = useContext(gameContext);

    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            {roomList.map((roomName) => (
                <>
                    <h1 ref={roomNameRef}>{roomName}</h1>
                    <button onClick={(e) => {
                        setRoomName(roomName); 
                        joinRoom(e, roomName, true);
                        }}
                    >
                        JOIN
                    </button>
                </>                   
            ))}
        </div>
    )
}

export default RoomList
