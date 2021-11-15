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

    const joinRoom = async (e: React.FormEvent, roomName: string, createRoom: boolean) => {
        e.preventDefault();
        const socket = socketService.socket;
        if(!roomName || roomName.trim() === '' || !socket) return;

        setJoining(true);

        const joined = await gameService
        .joinGameRoom(socket, roomName, createRoom)
        .catch((err) => {
            alert(err);
            window.location.reload();
        });

        if(joined) setInRoom(true);

        setJoining(false);
    }

    return (
        <>
        
            <div className="join-room-div">
            <div className="group">      
                <input value={roomName} onChange={handleRoomNameChange} />
                <span className="highlight"></span>
                <span className="bar"></span>
                <label>RoomName</label>
            </div>
                <button className='button1' disabled={isJoining} onClick={(e) => {joinRoom(e, roomName, true)}}>{isJoining ? 'Creating...' : 'CREATE'}</button>
                <button className='button1' disabled={isJoining} onClick={(e) => {joinRoom(e, roomName, false)}}>{isJoining ? 'Joining...' : 'JOIN'}</button>
            </div>
            <div className='room-list'>
                <RoomList roomList={roomList} joinRoom={joinRoom}/>
            </div>
        </>
    )
}