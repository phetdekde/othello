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
            <>
            {roomList[0] !== '' ?
                roomList.map((roomName) => (
                
                    <div className="room">
                            <h4 ref={roomNameRef}>{roomName}</h4>
                            <button className ='button2'onClick={(e) => {
                            setRoomName(roomName); 
                            joinRoom(e, roomName, false);
                            }}
                            >Join</button>
                    </div>
                        
                   
                )) : <></>
            }
        </>
    )
}

export default RoomList
