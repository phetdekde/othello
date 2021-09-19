import React, { useContext, useState, useEffect, useRef } from 'react';
import gameContext from '../../gameContext';
import reportWebVitals from '../../reportWebVitals';
import gameService from '../../services/gameService';
import socketService from '../../services/socketService';
import Piece from './Piece';

export type IPlayMatrix = Array<Array<number>>;
export interface IStartGame {
    start: boolean;
    color: 1 | 2;
}

export function Game() {

    const [matrix, setMatrix] = useState<IPlayMatrix>([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ]);

    const { playerColor, setPlayerColor, setPlayerTurn, isPlayerTurn, setGameStarted, isGameStarted } = useContext(gameContext);

    const hintLayer = useRef(null);

    const clickedSquare = (row: number, col: number) => {
        console.log('row ' + row)
        console.log('col' + col)
        const newMatrix = [...matrix];
        /*
            If there is no disk there
                get all of the affected disks
                flip them
            else
                return
        */
        if(newMatrix[row][col] !== 0) return;
        if(canClickSpot(row, col, playerColor)) {
            var affectedDisks = getAffectedDisks(row, col, playerColor);
            console.log(affectedDisks);
            flipDisks(affectedDisks);
            newMatrix[row][col] = playerColor;
            setMatrix(newMatrix);

            var blackCanMove = canThisPlayerMove(1);
            console.log('can black move : ' + blackCanMove)
            var whiteCanMove = canThisPlayerMove(2);
            console.log('can white move : ' + whiteCanMove)
            
            if(socketService.socket) {
                if((playerColor === 1 && whiteCanMove) || (playerColor === 2 && blackCanMove)) {
                    gameService.updateGame(socketService.socket, newMatrix);
                } else {
                    // gameService.updateGame(socketService.socket, newMatrix);
                    var yourScore = 0;
                    var enemyScore = 0;
                    for (let row = 0; row < 8; row++) {
                        for (let col = 0; col < 8; col++) {
                            var value = newMatrix[row][col];
                            if(value === playerColor) yourScore++
                            else if(value !== playerColor && value !== 0) enemyScore++
                        }
                    }
                    if(yourScore > enemyScore) {
                        gameService.gameWin(socketService.socket, 'You Lost!\nYour Score:' + enemyScore + '\nEnemy score: ' + yourScore);
                        alert('You Won!\nYour score: ' + yourScore + '\nEnemy score: ' + enemyScore);
                    } else if(yourScore < enemyScore){
                        gameService.gameWin(socketService.socket, 'You Won!\nYour score: ' + enemyScore + '\nEnemy score: ' + yourScore);
                        alert('You Lost!\nYour score: ' + yourScore + '\nEnemy score: ' + enemyScore);
                    } else {
                        gameService.gameWin(socketService.socket, 'Tie!');
                        alert('Tie!')
                    }
                }
                setPlayerTurn(false);
            }
        }
    }

    const canClickSpot = (row: number, col: number, color: number) => {
        /*
            If length of affected disks by clicking this spot is 0
                return false
            otherwise 
                return true
        */
       var affectedDisks = getAffectedDisks(row, col, color);
       if(affectedDisks.length === 0) {
           return false;
       }
       else return true;
    }

    const getAffectedDisks = (row: number, col: number, color: number) => {
        var affectedDisks:object[] = [];

        //left to right
        var couldBeAffected:object[] = [];
        var columnIterator = col;
        while(columnIterator < 7) {
            columnIterator++;
            var valueAtSpot = matrix[row][columnIterator];
            if(valueAtSpot === 0 || valueAtSpot === color) {
                if(valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = {row: row, col: columnIterator}
                couldBeAffected.push(diskLocation);
            }
        }

        //right to left
        var couldBeAffected:object[] = [];
        var columnIterator = col;
        while(columnIterator > 0) {
            columnIterator--;
            var valueAtSpot = matrix[row][columnIterator];
            if(valueAtSpot === 0 || valueAtSpot === color) {
                if(valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = {row: row, col: columnIterator}
                couldBeAffected.push(diskLocation);
            }
        }

        //down to up
        var couldBeAffected:object[] = [];
        var rowIterator = row;
        while(rowIterator > 0) {
            rowIterator--;
            var valueAtSpot = matrix[rowIterator][col];
            if(valueAtSpot === 0 || valueAtSpot === color) {
                if(valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = {row: rowIterator, col: col}
                couldBeAffected.push(diskLocation);
            }
        }

        //up to down
        var couldBeAffected:object[] = [];
        var rowIterator = row;
        while(rowIterator < 7) {
            rowIterator++;
            var valueAtSpot = matrix[rowIterator][col];
            if(valueAtSpot === 0 || valueAtSpot === color) {
                if(valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = {row: rowIterator, col: col}
                couldBeAffected.push(diskLocation);
            }
        }

        //down right
        var couldBeAffected:object[] = [];
        var rowIterator = row, columnIterator = col;
        while(rowIterator < 7 && columnIterator < 7) {
            rowIterator++;
            columnIterator++;
            var valueAtSpot = matrix[rowIterator][columnIterator];
            if(valueAtSpot === 0 || valueAtSpot === color) {
                if(valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = {row: rowIterator, col: columnIterator}
                couldBeAffected.push(diskLocation);
            }
        }

        //down left
        var couldBeAffected:object[] = [];
        var rowIterator = row, columnIterator = col;
        while(rowIterator < 7 && columnIterator > 0) {
            rowIterator++;
            columnIterator--;
            var valueAtSpot = matrix[rowIterator][columnIterator];
            if(valueAtSpot === 0 || valueAtSpot === color) {
                if(valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = {row: rowIterator, col: columnIterator}
                couldBeAffected.push(diskLocation);
            }
        }

        //up left
        var couldBeAffected:object[] = [];
        var rowIterator = row, columnIterator = col;
        while(rowIterator > 0 && columnIterator > 0) {
            rowIterator--;
            columnIterator--;
            var valueAtSpot = matrix[rowIterator][columnIterator];
            if(valueAtSpot === 0 || valueAtSpot === color) {
                if(valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = {row: rowIterator, col: columnIterator}
                couldBeAffected.push(diskLocation);
            }
        }

        //up right
        var couldBeAffected:object[] = [];
        var rowIterator = row, columnIterator = col;
        while(rowIterator > 0 && columnIterator < 7) {
            rowIterator--;
            columnIterator++;
            var valueAtSpot = matrix[rowIterator][columnIterator];
            if(valueAtSpot === 0 || valueAtSpot === color) {
                if(valueAtSpot === color) {
                    affectedDisks = affectedDisks.concat(couldBeAffected);
                }
                break;
            } else {
                var diskLocation = {row: rowIterator, col: columnIterator}
                couldBeAffected.push(diskLocation);
            }
        }

        return affectedDisks;
    }

    const flipDisks = (affectedDisks: Array<any>) => {
        /*
            for all items in affectDisks
                if the disk at that spot has value 1
                    make it 2
                else
                    make it 2
        */
       affectedDisks.forEach(e => {
           matrix[e.row][e.col] === 1 ? matrix[e.row][e.col] = 2 : matrix[e.row][e.col] = 1;
        });
    }

    const canThisPlayerMove = (color: number) => {
        console.log(matrix)
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if(canClickSpot(row, col, color)) {
                    console.log(color + ' spot is = row: ' + row + ' | col: ' + col);
                    return true;
                }
            }
        }
        return false;
    }

    const handleGameUpdate = () => {
        if(socketService.socket)
            gameService.onGameUpdate(socketService.socket, (newMatrix) => {
                setMatrix(newMatrix);
                // checkGameState(newMatrix);
                setPlayerTurn(true);
            });
    }

    const handleGameStart = () => {
        if(socketService.socket)
            gameService.onStartGame(socketService.socket, (options) => {
                setGameStarted(true);
                setPlayerColor(options.color);
                if(options.start)
                    setPlayerTurn(true);
                else
                    setPlayerTurn(false);
            });
    }

    const handleGameWin = () => {
        if(socketService.socket)
            gameService.onGameWin(socketService.socket, (message) => {
                setPlayerTurn(false);
                alert(message);
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
        handleGameWin();
        handleDisconnect();
    }, []);

    return (
        <>
        <div style={{display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center'}}>
            {!isGameStarted && <h2>Waiting for other player to join...</h2>}
            {(isGameStarted) && (isPlayerTurn ? <h2>Your turn {playerColor === 1 ? 'black' : 'white'}</h2> : <h2>Enemy's turn</h2>)}
            {(!isGameStarted || !isPlayerTurn) && <div style={{width: '100%', height: '100%', position:'absolute', bottom: '0', left: '0', zIndex: 99, cursor: 'default'}}></div>}
            {matrix.map((row, rowIdx) => {
                return (
                    <div style={{display: 'flex'}}>
                        {row.map((column, columnIdx) => ( 
                            <div style={{border: '1px solid black', width: '100px', height: '100px', display: 'flex', alignItems: 'center'}} onClick={() => clickedSquare(rowIdx, columnIdx)}>
                                {column !== 0 ? (
                                    <Piece color={column}/>
                                ) : (
                                    canClickSpot(rowIdx, columnIdx, playerColor) ? (
                                        <div style={{width: '75%', height: '75%', border: '2px solid gray', zIndex: 2, borderRadius: '50%', margin: '0 auto'}} onClick={() => clickedSquare(rowIdx, columnIdx)}></div>
                                        ) : (
                                        ''
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                )
            })}
            <button style={{height: '2rem', width: '6rem', zIndex: 100, marginTop: '2rem'}} onClick={() => window.location.reload()}>GO BACK</button>
        </div>
        </>
    )
}