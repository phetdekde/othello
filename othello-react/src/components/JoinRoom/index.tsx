import React, { useContext, useState, useEffect } from 'react';
import gameContext from '../../gameContext';
import gameService from '../../services/gameService';
import socketService from '../../services/socketService';
import RoomList from '../../components/RoomList';

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {
    const [roomName, setRoomName] = useState('');
    const [isJoining, setJoining] = useState(false);

    const { setInRoom, roomList } = useContext(gameContext);

    const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
        const value = e.target.value;
        setRoomName(value);
    }

    const joinRoom = async (e: React.FormEvent, roomName: string) => {
        e.preventDefault();
        const socket = socketService.socket;
        if(!roomName || roomName.trim() === '' || !socket) return;

        setJoining(true);

        const joined = await gameService
        .joinGameRoom(socket, roomName)
        .catch((err) => {
            alert(err);
        });

        if(joined) setInRoom(true);

        setJoining(false);
    }

    return (
        <>
            <form onSubmit={(e) => {joinRoom(e, roomName)}}>
                <div className='join-room-div'>
                    <h3>Enter room ID</h3>
                    <input value={roomName} onChange={handleRoomNameChange} />
                    <button
                        type='submit'
                        className='button'
                        disabled={isJoining}>{isJoining ? 'Joining...' : 'JOIN'}
                    </button>
                </div>
            </form>
            <div className='room-list'>
                <RoomList roomList={roomList} joinRoom={joinRoom}/>
            </div>
        </>
    )
}