import { GameLogic } from "./gameLogic";

export class AI1 {
    public gameLogic:GameLogic;
    
    constructor(gameLogic: GameLogic) {
        this.gameLogic = new GameLogic(gameLogic.getBoard());
    }

    public ai1Called(color: number) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if(this.gameLogic.canClickSpot(row, col, color)) {
                    return {row, col};
                }
            }
        }
    }
}