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
    selectedPlayer: string;
    setSelectedPlayer: (selected: string) => void;
    isGameFinished: boolean;
    setGameFinished: (finished: boolean) => void;
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
    selectedPlayer: 'human',
    setSelectedPlayer: () => {},
    isGameFinished: false,
    setGameFinished: () => {},
};

export default React.createContext(defaultState);