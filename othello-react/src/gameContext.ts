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
};

const defaultState: IGameContextProps = {
    isInRoom: false,
    setInRoom: () => {},
    playerColor: 1,
    setPlayerColor: () => {},
    isPlayerTurn: false,
    setPlayerTurn: () => {},
    isGameStarted: false,
    setGameStarted: () => {}
};

export default React.createContext(defaultState);