import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import { io } from 'socket.io-client';
import socketService from './services/socketService';
import { JoinRoom } from './components/JoinRoom';
import GameContext, { IGameContextProps } from './gameContext';
import { Game } from './components/game';

//หน้าแรกที่จะ render
function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<'x' | 'o'>('x');
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);

  const connectSocket = async () => {
    const socket = await socketService
    // .connect('http://localhost:9000')
    .connect('http://phetdekde.trueddns.com:14924/')
    .catch((err) => {
      console.log("Error: ", err);
    });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    playerSymbol,
    setPlayerSymbol,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted
  }

  return (
    <GameContext.Provider value={gameContextValue}> 
      <h1 style={{textAlign: 'center'}}>Welcome to Tic-Tac-Toe</h1>
      { !isInRoom && <JoinRoom/> }
      { isInRoom && <Game/> }
    </GameContext.Provider>
  );
}

export default App;
