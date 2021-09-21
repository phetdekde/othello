import { IPlayMatrix } from './index';
import gameContext from '../../gameContext';
import React, { useContext } from 'react'
import socketService from '../../services/socketService';
import gameService from '../../services/gameService';
// import { Game }from './index'

export class GameLogic {

    public matrix: Array<Array<number>> = [];
    public playerColor: number = 1;
    public isPlayerTurn: boolean = false;
    public isGameStarted: boolean = false;
    public selectedPlayer: string = 'human';
    public isGameFinished: boolean = false;

    constructor(matrix: Array<Array<number>>, playerColor: number, isPlayerTurn: boolean, isGameStarted: boolean, selectedPlayer: string, isGameFinished: boolean) {
        this.matrix = matrix;
        this.playerColor = playerColor;
        this.isPlayerTurn = isPlayerTurn;
        this.isGameStarted = isGameStarted;
        this.selectedPlayer = selectedPlayer;
        this.isGameFinished = isGameFinished;
    }

    public hello() {
        console.log(this.matrix)
    }
}

