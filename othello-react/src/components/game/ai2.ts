import internal from "stream";
import { Z_BEST_COMPRESSION } from "zlib";
import { GameLogic } from "./gameLogic";

export class AI2 {
    public gameLogic:GameLogic;
    public scorePos = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],  
    ];
    public h = 6;


    constructor(gameLogic: GameLogic) {
        this.gameLogic = new GameLogic(gameLogic.getBoard());
        this.makeScorePos(this.scorePos);
    }

    //First function will be called here
    public ai2Called(color: number) {
        let bestscore  = -Infinity;
        let bestrow = 0;
        let bestcol = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if(this.gameLogic.canClickSpot(row, col, color)) {
                    let score = this.scoring(this.gameLogic, row, col, color) + this.minimax(this.gameLogic, 0, false, color, 0);
                    console.log(score);
                    if (bestscore < score) {
                        bestscore = score;
                        bestrow = row;
                        bestcol = col;
                    }
                }
            }
        }
        
        var pos = {'row': bestrow, 'col': bestcol};
        console.log(bestscore, pos);
        // return {row, col}
        if (this.gameLogic.getMovableCell(color).length !== 0) {
            return pos;
        }
        // var testObj = new GameLogic(this.gameLogic.getBoard());
        // testObj.move(1,2,1)
    }

    private makeScorePos(scorePos: number[][]) {
        this.scorePos = scorePos;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.scorePos[row][col] = 1; //score normal tile
                if (row == 1 || row == 6 || col == 1 || col == 6) {
                    this.scorePos[row][col] = -100; //score almost edge
                }
                if (row == 0 || row == 7 || col == 0 || col == 7) {
                    this.scorePos[row][col] = 100; //score edge
                    if (row == col || (row == 0 && col == 7) || row == 7 && col == 0){
                        this.scorePos[row][col] = 1000; //score coner
                    }
                    if (row === 1 || row === 6 || col === 1 || col === 6){
                        this.scorePos[row][col] = -1000; //score noob tile
                    }
                }
                if ((row == 1 && col == 1) || (row == 1 && col == 6) || (row == 6 && col == 1) || (row == 6 && col == 6)) {
                    this.scorePos[row][col] = -1000; //score noob tile
                }
            }
        }
    }

    private minimax(board: GameLogic, depth: number, isMax: boolean, color: number, result: number) {
        let opponent = color === 1 ? 2:1;
        if (depth >= this.h || board.isTerminal() ) {
            return result;
        }
        if ((isMax && board.getMovableCell(color).length === 0) || (!isMax && board.getMovableCell(opponent).length === 0)) {
            return result;
        }

        
        let bestmove = [0, 0];
        if (isMax) {
            let bestscore  = -100000;
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if(board.canClickSpot(row, col, color)) {
                        var score = this.scoring(board, row, col, color);
                        if (bestscore < score) {
                            bestscore = score;
                            bestmove = [row, col];
                        }
                    }
                }
            }
            let Maty = new GameLogic(board.getBoard());
            Maty.move(bestmove[0], bestmove[1], color);
            bestscore = bestscore + this.minimax(Maty, depth + 1, false, opponent, bestscore);
            return result + bestscore;
        }
        else {
            let bestscore  = 100000;
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if(board.canClickSpot(row, col, color)) {
                        let score = this.scoring(board, row, col, color);
                        if (bestscore > score) {
                            bestscore = score;
                            bestmove = [row, col];
                        }
                    }
                }
            }
            let Maty = new GameLogic(board.getBoard());
            Maty.move(bestmove[0], bestmove[1], color);
            bestscore = bestscore + this.minimax(Maty, depth + 1, true, opponent, bestscore);
            return result - bestscore;
        }
    }

    private scoring(board: GameLogic, x: number, y: number, color: number) {
        let stable = this.gameLogic.getStableDisc(color).length;
        let frontier = this.gameLogic.getFrontierDisc(color).length;
        let pos = this.scorePos[x][y];
        let flip = this.gameLogic.getAffectedDisks(x, y, color).length;
        let score = pos + (stable - frontier)*4 + flip;
        return score;
    }

    
}
