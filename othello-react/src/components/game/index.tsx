import React, { useContext, useState, useEffect } from 'react';
import gameContext from '../../gameContext';
import reportWebVitals from '../../reportWebVitals';
import gameService from '../../services/gameService';
import socketService from '../../services/socketService';

export type IPlayMatrix = Array<Array<string | null>>;
export interface IStartGame {
    start: boolean;
    symbol: 'x' | 'o';
}

export function Game() {

    const [matrix, setMatrix] = useState<IPlayMatrix>([
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ]);

    const { playerSymbol, setPlayerSymbol, setPlayerTurn, isPlayerTurn, setGameStarted, isGameStarted } = useContext(gameContext);

    const checkGameState = (matrix: IPlayMatrix) => {
        for (let i = 0; i < matrix.length; i++) {
            let row = [];
            for (let j = 0; j < matrix[i].length; j++) {
                row.push(matrix[i][j]);
            }

            if (row.every((value) => value && value === playerSymbol)) {
                return [true, false];
            } else if (row.every((value) => value && value !== playerSymbol)) {
                return [false, true];
            }
        }

        for (let i = 0; i < matrix.length; i++) {
            let column = [];
            for (let j = 0; j < matrix[i].length; j++) {
                column.push(matrix[j][i]);
            }
            
            if (column.every((value) => value && value === playerSymbol)) {
                return [true, false];
            } else if (column.every((value) => value && value !== playerSymbol)) {
                return [false, true];
            }
        }

        if (matrix[1][1]) {
            if (matrix[0][0] === matrix[1][1] && matrix[2][2] === matrix[1][1]) {
                if (matrix[1][1] === playerSymbol) return [true, false];
                else return [false, true];
            }

            if (matrix[2][0] === matrix[1][1] && matrix[0][2] === matrix[1][1]) {
                if (matrix[1][1] === playerSymbol) return [true, false];
                else return [false, true];
            }
        }

        //Check for a tie
        if (matrix.every((m) => m.every((v) => v !== null))) {
            return [true, true];
        }

        return [false, false];
    };
    
    //ตอนกด
    const updateGameMatrix = (column: number, row: number, symbol: 'x' | 'o') => {
        const newMatrix = [...matrix];

        //มันจะ render ส่วนของตารางใหม่ทั้งหมด
        if(newMatrix[row][column] === null || newMatrix[row][column] === 'null') {
            newMatrix[row][column] = symbol;
            setMatrix(newMatrix);
        }

        if(socketService.socket) {
            gameService.updateGame(socketService.socket, newMatrix);
            const [currentPlayerWon, otherPlayerWon] = checkGameState(newMatrix) as any;
            
            if(currentPlayerWon && otherPlayerWon) {
                gameService.gameWin(socketService.socket, 'The Game is a Tie!');
                alert('The Game is a Tie!');
            } else if(currentPlayerWon && !otherPlayerWon) {
                gameService.gameWin(socketService.socket, 'You Lost!');
                alert('You Won!');
            }
            setPlayerTurn(false);
        }          
    };

    const handleGameUpdate = () => {
        if(socketService.socket)
            gameService.onGameUpdate(socketService.socket, (newMatrix) => {
                setMatrix(newMatrix);
                checkGameState(newMatrix);
                setPlayerTurn(true);
            });
    }

    const handleGameStart = () => {
        if(socketService.socket)
            gameService.onStartGame(socketService.socket, (options) => {
                //set คนเริิม + สัญลักษณ์
                setGameStarted(true);
                setPlayerSymbol(options.symbol);
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

    useEffect(() => { //อันนี้รันทั้งหมดตอน render หน้าเสร็จครั้งแรก
        handleGameUpdate();
        handleGameStart();
        handleGameWin();
        handleDisconnect();
    }, []);

    return (
        <div style={{display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center'}}>
            {!isGameStarted && <h2>Waiting for other player to join...</h2>}
            {(isGameStarted) && (isPlayerTurn ? <h2>Your turn {playerSymbol}</h2> : <h2>Enemy's turn</h2>)}
            {(!isGameStarted || !isPlayerTurn) && <div style={{width: '100%', height: '100%', position:'absolute', bottom: '0', left: '0', zIndex: 99, cursor: 'default'}}></div>}
            {matrix.map((row, rowIdx) => {
                return (
                    <div style={{display: 'flex'}}>
                        {row.map((column, columnIdx) => ( 
                            <div style={{border: '1px solid black', width: '100px', height: '100px'}} onClick={() => updateGameMatrix(columnIdx, rowIdx, playerSymbol)}>
                                {column && column !== 'null' ? 
                                (column === 'x' ? ('X') : ('O')) : null}
                            </div>
                        ))}
                    </div>
                )
            })}
            <button style={{height: '2rem', width: '6rem', zIndex: 100, marginTop: '2rem'}} onClick={() => window.location.reload()}>GO BACK</button>
        </div>
    )
}