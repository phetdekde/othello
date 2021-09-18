import React, { useContext, useState } from 'react';
import gameContext from '../../gameContext';
import gameService from '../../services/gameService';
import socketService from '../../services/socketService';

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {
    const [roomName, setRoomName] = useState('');
    const [isJoining, setJoining] = useState(false);

    const { setInRoom, isInRoom } = useContext(gameContext);

    const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
        const value = e.target.value;
        setRoomName(value);
    }

    const joinRoom = async (e: React.FormEvent) => {
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
        <form onSubmit={joinRoom}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <h3>Enter room ID</h3>
                <input value={roomName} onChange={handleRoomNameChange}/>
                <button 
                    type='submit' 
                    style={{height: '2rem', width: '6rem', zIndex: 100, marginTop: '2rem'}} 
                    disabled={isJoining}>{ isJoining ? 'Joining...' : 'JOIN'}</button>
            </div>
        </form>
    )
}