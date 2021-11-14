import { GameLogic } from "./gameLogic";
import { Minimax } from "./AI1_src/minmax";
import { platform } from "process";

export class AI1 {
    public currstate:GameLogic;
    
    constructor(gameLogic: GameLogic) {
        this.currstate = new GameLogic(gameLogic.getBoard());
    }

    public ai1Called(color: number) {
        const cornerplay = this.playOncorner(color);
        if(cornerplay) {
            let row = cornerplay[0];
            let col = cornerplay[1];
            return {row, col};
        }

        const blockplay = this.blocking(color);
        if(blockplay) {
            let row = blockplay[0];
            let col = blockplay[1];
            return {row, col};
        }

        const nextplay = Minimax.solve(this.currstate, color, 4);
        if(nextplay) {
            let row = nextplay[0];
            let col = nextplay[1];
            return {row, col};
        }
    }

    private playOncorner(color: number) {
        const corners = [[0,0], [0,7], [7,0], [7,7]];
        const movable = this.currstate.getMovableCell(color);
        let bestmove = null;
        let bestscore = Number.MIN_SAFE_INTEGER;
        for(let move of movable){
            if(move.includes(0) || move.includes(7)){
                let newstate = new GameLogic(this.currstate.getBoard());
                newstate.move(move[0], move[1], color);
                let mscore = Minimax.hueristic(newstate, color);
                if(mscore > bestscore) {
                    bestscore = mscore;
                    bestmove = move;
                }
            }
        }
        return bestmove;
    }

    private blocking(color: number) {
        const movable = this.currstate.getMovableCell(color);
        const opponent = color === 1 ? 2 : 1;
        let bestmove = null;
        let bestscore = Number.MIN_SAFE_INTEGER;
        for(let move of movable){
            let newstate = new GameLogic(this.currstate.getBoard());
            newstate.move(move[0], move[1], color);
            if(newstate.getMovableCell(opponent).length === 0) {
                let mscore = Minimax.hueristic(newstate, color);
                if(mscore > bestscore) {
                    bestscore = mscore;
                    bestmove = move;
                }
            }
        }
        return bestmove;
    }
}