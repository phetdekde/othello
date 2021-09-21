import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import { io } from 'socket.io-client';
import socketService from './services/socketService';
import { JoinRoom } from './components/JoinRoom';
import GameContext, { IGameContextProps } from './gameContext';
import { Game } from './components/game';

function App() {
  const [isInRoom, setInRoom] = useState(false);
  const [playerColor, setPlayerColor] = useState<1 | 2>(1);
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [isGameStarted, setGameStarted] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('human');
  const [isGameFinished, setGameFinished] = useState(false);
  const [matrix, setMatrix] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);

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
    playerColor,
    setPlayerColor,
    isPlayerTurn,
    setPlayerTurn,
    isGameStarted,
    setGameStarted,
    selectedPlayer,
    setSelectedPlayer,
    isGameFinished,
    setGameFinished,
    matrix,
    setMatrix,
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
