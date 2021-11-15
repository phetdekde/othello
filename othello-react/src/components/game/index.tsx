import React, { useContext, useState, useEffect } from 'react';
import gameContext from '../../gameContext';
import gameService from '../../services/gameService';
import socketService from '../../services/socketService';
import Label from '../../components/Label';
import Piece from '../../components/Piece';
import { GameLogic } from './gameLogic'
import { AI1 } from './ai1';
import { AI2 } from './ai2';

export type IPlayMatrix = Array<Array<number>>;
export interface IStartGame {
    start: boolean;
    color: 1 | 2;
}

export function Game() {

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
    const [isReady, setReady] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState('human');

    const { 
        playerColor,    setPlayerColor, 
        isPlayerTurn,   setPlayerTurn,
        isGameStarted,  setGameStarted,
        roomName, 
        isGameFinished, setGameFinished, 
    } = useContext(gameContext);

    var gameLogic = new GameLogic(matrix);

    const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPlayer(e.target.value);
    }

    const clickedSquare = async (row: number, col: number) => { 
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
            console.log('PLAYED');
            setPlayerTurn(false);
            var newMatrix = gameLogic.move(row, col, playerColor).getBoard();
            setMatrix(newMatrix);
            if(socketService.socket) {
                gameService.updateGame(socketService.socket, matrix);
            }
        }
    }

    const handleRoomJoined = () => {
        if(socketService.socket) {
            gameService.onRoomJoined(socketService.socket, () => {
                setReady(true);
            })
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
                socketService.socket?.disconnect();
                setPlayerTurn(false);
                alert(message);
            });
    }

    useEffect(() => {
        handleRoomJoined();
        handleGameStart();
        handleGameUpdate();
        handleGameReset();
        handleDisconnect();
    }, []);

    useEffect(() => {
        if(!isPlayerTurn) return;
        if(gameLogic.getMovableCell(playerColor).length !== 0) {
            if(selectedPlayer !== 'human') {
                if(selectedPlayer === 'ai1') {
                    var ai1 = new AI1(gameLogic);
                    let pos = ai1.ai1Called(playerColor);
                    if(pos !== undefined) {
                        clickedSquare(pos.row, pos.col)
                    }
                } else {
                    var ai2 = new AI2(gameLogic);
                    let pos = ai2.ai2Called(playerColor);
                    if(pos !== undefined) {
                        clickedSquare(pos.row, pos.col)
                    }
                }
            }
        } else {
            if(socketService.socket) {
                console.log('NO CELL')
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
            <div className='game-div'>
                <Label label={'Room name : ' + roomName} />
                {!isGameStarted && (!isReady ? <Label label={'Waiting for other player to join...'}/> : <Label label={'Player joined!'}/>)}
                {isGameStarted && (isPlayerTurn ? <Label label={'Your turn ' + (playerColor === 1 ? 'black' : 'white')}/> : <Label label={"Enemy's turn"}/>)}
                {(!isGameStarted || !isPlayerTurn) && <div className='overlay'></div>}
                {matrix.map((row, rowIdx) => {
                    return (
                        <div style={{ display: 'flex' }}>
                            {row.map((column, columnIdx) => (
                                <div className='cell' onClick={() => clickedSquare(rowIdx, columnIdx)}>
                                    {column !== 0 ? (
                                        <Piece color={column} />
                                    ) : (
                                        gameLogic.canClickSpot(rowIdx, columnIdx, playerColor) && isPlayerTurn ? (
                                            <Piece color={column} />
                                        ) : (
                                            ''
                                        ) 
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                })}
                <button className='button' disabled={isGameStarted || !isReady} onClick={startGame}>START</button>
                <button className='button' disabled={!isGameFinished} onClick={resetGame}>RESET</button>
                <select className='dropdown' disabled={isGameStarted} onChange={handlePlayerChange}>
                    <option value='human'>Human</option>
                    <option value='ai1'  >AI 1</option>
                    <option value='ai2'  >AI 2</option>
                </select>
                <button className='button' onClick={() => window.location.reload()}>GO BACK</button>
                <div className='character'>
                    <img className={`left res res_left ${isPlayerTurn?(playerColor === 2?'':'dark'):(playerColor ===1 ?'':'dark')}`} src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5e5896a5-4a79-496a-bea4-81f26cfa2650/de911hw-e03015c9-8ded-4121-ae94-9eeeec418882.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzVlNTg5NmE1LTRhNzktNDk2YS1iZWE0LTgxZjI2Y2ZhMjY1MFwvZGU5MTFody1lMDMwMTVjOS04ZGVkLTQxMjEtYWU5NC05ZWVlZWM0MTg4ODIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.TbYpWK7BSDAfh-eDWj1zZXtOh28L4qVOLpRieQJhJtA"/>
                    <img className={`img left ${isPlayerTurn?(playerColor === 2?'':'dark'):(playerColor ===1 ?'':'dark')}`} src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5e5896a5-4a79-496a-bea4-81f26cfa2650/de911bk-92fa2bc6-78c3-4ee1-803f-8a690f768df9.png/v1/fill/w_1280,h_1790,strp/ningguang_genshin_impact_character_png_by_deg5270_de911bk-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTc5MCIsInBhdGgiOiJcL2ZcLzVlNTg5NmE1LTRhNzktNDk2YS1iZWE0LTgxZjI2Y2ZhMjY1MFwvZGU5MTFiay05MmZhMmJjNi03OGMzLTRlZTEtODAzZi04YTY5MGY3NjhkZjkucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.5DCA5KzeKaAWNLaCVrv8lULY5seD34bhwUflUfdj4x0"/>
                    <img className={`flip res res_right ${isPlayerTurn?(playerColor === 1?'':'dark'):(playerColor ===2 ?'':'dark')}`} src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5e5896a5-4a79-496a-bea4-81f26cfa2650/de910q8-18db91c0-990c-420a-8a95-b78f7a57eccd.png/v1/fill/w_1280,h_2391,strp/klee_genshin_impact_character_png_by_deg5270_de910q8-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjM5MSIsInBhdGgiOiJcL2ZcLzVlNTg5NmE1LTRhNzktNDk2YS1iZWE0LTgxZjI2Y2ZhMjY1MFwvZGU5MTBxOC0xOGRiOTFjMC05OTBjLTQyMGEtOGE5NS1iNzhmN2E1N2VjY2QucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.L8L6CqwfET7ty7Q-sHFupjSZalDiteazo-x6n61e6v4"/>
                    <img className={`img flip ${isPlayerTurn?(playerColor === 1?'':'dark'):(playerColor ===2 ?'':'dark')}`} src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5e5896a5-4a79-496a-bea4-81f26cfa2650/deeqrmg-2f0ccbc4-b403-43d2-b105-d62ca5a3fc94.png/v1/fill/w_1280,h_1490,strp/zhongli_genshin_impact_character_png_by_deg5270_deeqrmg-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTQ5MCIsInBhdGgiOiJcL2ZcLzVlNTg5NmE1LTRhNzktNDk2YS1iZWE0LTgxZjI2Y2ZhMjY1MFwvZGVlcXJtZy0yZjBjY2JjNC1iNDAzLTQzZDItYjEwNS1kNjJjYTVhM2ZjOTQucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.rdRHGbC_oRjnpMnNxbcQMhqK-QjoDaf2zfqoTHsIbPI"/>
                </div>
            </div>
        </>
    )
}