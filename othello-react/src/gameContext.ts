import React from 'react';

export interface IGameContextProps {
    isInRoom: boolean;
    setInRoom: (inRoom: boolean) => void;
    playerColor: 1 | 2;
    setPlayerColor: (symbol: 1 | 2) => void;
    isPlayerTurn: boolean;
    setPlayerTurn: (turn: boolean) => void;
    isGameStarted: boolean;
    setGameStarted: (started: boolean) => void;
    isGameFinished: boolean;
    setGameFinished: (finished: boolean) => void;
    roomName: string;
    setRoomName: (roomName: string) => void;
    roomList: Array<string>;
    setRoomList: (roomList: Array<string>) => void;
};

const defaultState: IGameContextProps = {
    isInRoom: false,
    setInRoom: () => {},
    playerColor: 1,
    setPlayerColor: () => {},
    isPlayerTurn: false,
    setPlayerTurn: () => {},
    isGameStarted: false,
    setGameStarted: () => {},
    isGameFinished: false,
    setGameFinished: () => {},
    roomName: '',
    setRoomName: () => {},
    roomList: [],
    setRoomList: () => {}
};

export default React.createContext(defaultState);