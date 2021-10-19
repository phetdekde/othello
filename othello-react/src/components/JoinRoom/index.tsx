import React, { useContext, useState } from 'react';
import gameContext from '../../gameContext';
import gameService from '../../services/gameService';
import socketService from '../../services/socketService';
import RoomList from '../../components/RoomList';

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {
    const [isJoining, setJoining] = useState(false);

    const { setInRoom, roomList, roomName, setRoomName } = useContext(gameContext);

    const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
        const value = e.target.value;
        setRoomName(value);
    }

    const joinRoom = async (e: React.FormEvent, roomName: string, joinFromRoomList: boolean) => {
        e.preventDefault();
        const socket = socketService.socket;
        if(!roomName || roomName.trim() === '' || !socket) return;

        setJoining(true);

        const joined = await gameService
        .joinGameRoom(socket, roomName, joinFromRoomList)
        .catch((err) => {
            alert(err);
            window.location.reload();
        });

        if(joined) setInRoom(true);

        setJoining(false);
    }

    return (
        <>
            <form onSubmit={(e) => {joinRoom(e, roomName, false)}}>
                <div className='join-room-div'>
                    <h3>Enter room name to create or join room!</h3>
                    <h4>Want to create room? Just type your own room name.</h4>
                    <h4>Want to join room? Just type your friend's room name.</h4>
                    <input value={roomName} onChange={handleRoomNameChange} />
                    <button
                        type='submit'
                        className='button'
                        disabled={isJoining}
                    >
                        {isJoining ? 'Joining...' : 'CREATE / JOIN'}
                    </button>
                </div>
            </form>
            <div className='room-list'>
                <RoomList roomList={roomList} joinRoom={joinRoom}/>
            </div>
        </>
    )
}