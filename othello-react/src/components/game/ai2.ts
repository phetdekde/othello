import { GameLogic } from "./gameLogic";

export class AI2 {
    public gameLogic:GameLogic;

    constructor(GameLogic: GameLogic) {
        this.gameLogic = GameLogic;
    }

    public ai2Called(color: number) {
        for (let row = 7; row > -1; row--) {
            for (let col = 7; col > -1; col--) {
                if(this.gameLogic.canClickSpot(row, col, color)) {
                    return {row, col};
                }
            }
        }
    }
}