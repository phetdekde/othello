import React, { useContext, useState, useEffect } from 'react';
import gameContext from '../../gameContext';
import reportWebVitals from '../../reportWebVitals';
import gameService from '../../services/gameService';
import socketService from '../../services/socketService';
import Piece from './Piece';
import { GameLogic } from './gameLogic'
import { AI1 } from './ai1';
import { AI2 } from './ai2';

export type IPlayMatrix = Array<Array<number>>;
export interface IStartGame {
    start: boolean;
    color: 1 | 2;
}

export function Game() {

    const { 
        matrix,         setMatrix,
        playerColor,    setPlayerColor, 
        isPlayerTurn,   setPlayerTurn,
        isGameStarted,  setGameStarted,
        selectedPlayer, setSelectedPlayer, 
        isGameFinished, setGameFinished, 
    } = useContext(gameContext);

    var gameLogic = new GameLogic(matrix);

    const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlayer(e.target.value);
    }

    const clickedSquare = (row: number, col: number) => { 
        /*
            if there is a disk there already OR it's not your turn
                return
            if that spot can flip other disks
                flip them
                update the board
                change turn
        */

        if(matrix[row][col] !== 0 || !isPlayerTurn) return;

        var affectedDisks = gameLogic.getAffectedDisks(row, col, playerColor);
        if(affectedDisks.length !== 0) {

            var newMatrix = gameLogic.move(row, col, playerColor).getBoard();
            if(socketService.socket) {
                gameService.updateGame(socketService.socket, matrix);
            }

            setPlayerTurn(false);
            setMatrix(newMatrix);
        }
    }

    const startGame = () => {
        if(socketService.socket) {
            gameService.startGame(socketService.socket);
        }
    }

    const handleGameStart = () => {
        if(socketService.socket)
            gameService.onGameStart(socketService.socket, (options) => {
                setGameStarted(true);
                setPlayerColor(options.color);
                options.start ? setPlayerTurn(true) : setPlayerTurn(false);    
            });
    }

    const resetGameState = () => {
        setMatrix([
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 2, 1, 0, 0, 0],
            [0, 0, 0, 1, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],  
        ]);
        setGameFinished(false);
        setGameStarted(false);
        setPlayerTurn(false);
    }

    const resetGame = () => {
        resetGameState();
        if(socketService.socket) {
            gameService.resetGame(socketService.socket);
        }
    }

    const handleGameReset = () => {
        if(socketService.socket) {
            gameService.onGameReset(socketService.socket, () => {
                resetGameState();
            });
        }
    }

    const handleGameUpdate = () => {
        if(socketService.socket)
            gameService.onGameUpdate(socketService.socket, (newMatrix) => {
                setMatrix(newMatrix);
                setPlayerTurn(true);
            });
    }

    const handleDisconnect = () => {
        if(socketService.socket)
            gameService.onDisconnect(socketService.socket, (message) => {
                setPlayerTurn(false);
                alert(message);
                socketService.socket?.disconnect();
            });
    }

    useEffect(() => {
        handleGameUpdate();
        handleGameStart();
        handleDisconnect();
        handleGameReset();
    }, []);

    useEffect(() => {
        if(!isPlayerTurn) return;
        if(gameLogic.getMovableCell(playerColor).length !== 0) {
            if(selectedPlayer !== 'human') {
                if(selectedPlayer === 'ai1') {
                    var ai1 = new AI1(gameLogic);
                    var pos = ai1.ai1Called(playerColor);
                    if(pos !== undefined) {
                        clickedSquare(pos.row, pos.col)
                    }
                } else {
                    var ai2 = new AI2(gameLogic);
                    var pos = ai2.ai2Called(playerColor);
                    if(pos !== undefined) {
                        clickedSquare(pos.row, pos.col)
                    }
                }
            }
        } else {
            console.log('I cannot move')
            if(socketService.socket) {
                if(gameLogic.getMovableCell(playerColor === 1 ? 2 : 1).length !== 0) {
                    gameService.updateGame(socketService.socket, matrix);
                    setPlayerTurn(false);
                } else {
                    setGameFinished(true);
                }
            }
        }
    }, [isPlayerTurn])

    useEffect(() => {
        if(!isGameFinished) return;
        if(socketService.socket) {
            gameService.updateGame(socketService.socket, matrix);
            var blackScore = gameLogic.getScore(1);
            var whiteScore = gameLogic.getScore(2);
            if (blackScore > whiteScore) {
                alert('Black Won!\nBlack score: ' + blackScore + '\nWhite score: ' + whiteScore);
            } else if (blackScore < whiteScore) {
                alert('White Won!\nWhite score: ' + whiteScore + '\nBlack score: ' + blackScore);
            } else {
                alert('Tie!')
            }
        }
        setPlayerTurn(false);
    }, [isGameFinished])

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center' }}>
                {!isGameStarted && <h2>Waiting for other player to join...</h2>}
                {(isGameStarted) && (isPlayerTurn ? <h2>Your turn {playerColor === 1 ? 'black' : 'white'}</h2> : <h2>Enemy's turn</h2>)}
                {(!isGameStarted || !isPlayerTurn) && <div style={{ width: '100%', height: '100%', position: 'absolute', bottom: '0', left: '0', zIndex: 99, cursor: 'default' }}></div>}
                {matrix.map((row, rowIdx) => {
                    return (
                        <div style={{ display: 'flex' }}>
                            {row.map((column, columnIdx) => (
                                <div style={{ border: '1px solid black', width: '100px', height: '100px', display: 'flex', alignItems: 'center', backgroundColor: 'green' }} onClick={() => clickedSquare(rowIdx, columnIdx)}>
                                    {column !== 0 ? (
                                        <Piece color={column} />
                                    ) : (
                                        gameLogic.canClickSpot(rowIdx, columnIdx, playerColor) && isPlayerTurn ? (
                                            <div style={{ width: '75%', height: '75%', backgroundColor: 'yellow', zIndex: 2, borderRadius: '50%', margin: '0 auto', opacity: '0.8' }} ></div>
                                        ) : (
                                            ''
                                        ) 
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                })}
                <button style={{ height: '2rem', width: '6rem', zIndex: 100, marginTop: '2rem' }} disabled={isGameStarted} onClick={startGame}>START</button>
                <button style={{ height: '2rem', width: '6rem', zIndex: 100, marginTop: '2rem' }} disabled={!isGameFinished} onClick={resetGame}>RESET</button>
                <select disabled={isGameStarted} style={{ height: '2rem', width: '6rem', zIndex: 100, marginTop: '2rem' }} onChange={handlePlayerChange}>
                    <option value='human'>Human</option>
                    <option value='ai1'  >AI 1</option>
                    <option value='ai2'  >AI 2</option>
                </select>
                <button style={{ height: '2rem', width: '6rem', zIndex: 100, marginTop: '2rem' }} onClick={() => window.location.reload()}>GO BACK</button>
            </div>
        </>
    )
}