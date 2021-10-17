import { useEffect, useState } from 'react';
import socketService from './services/socketService';
import { JoinRoom } from './components/JoinRoom';
import GameContext, { IGameContextProps } from './gameContext';
import { Game } from './components/game';
import gameService from './services/gameService';

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
  const [roomList, setRoomList] = useState(['']);

  const connectSocket = async () => {
    const socket = await socketService
    // .connect('http://localhost:9000')
    .connect('https://evening-cove-27499.herokuapp.com')
    .catch((err) => {
      console.log("Error: ", err);
    });
  };

  const handleRoomList = () => {
    console.log(socketService.socket)
    if (socketService.socket) {
      gameService.onGettingRoomList(socketService.socket, (message) => {
        setRoomList(message);
      });
    }
  }

  useEffect(() => {
    connectSocket();
    handleRoomList();
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
    roomList,
    setRoomList,
  }

  return (
    <GameContext.Provider value={gameContextValue}>
      <h1 style={{ textAlign: 'center' }}>Welcome to Othello</h1>
      {!isInRoom && <JoinRoom />}
      {isInRoom && <Game />}
    </GameContext.Provider>
  );
}

export default App;
