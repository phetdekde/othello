import { GameLogic } from "./gameLogic";

export class AI1 {
    public gameLogic:GameLogic;

    constructor(GameLogic: GameLogic) {
        this.gameLogic = GameLogic;
    }

    public ai1Called(playerColor: number) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if(this.gameLogic.canClickSpot(row, col, playerColor)) {
                    return {row, col};
                }
            }
        }
    }
}