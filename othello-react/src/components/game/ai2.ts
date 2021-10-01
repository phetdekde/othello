import { GameLogic } from "./gameLogic";

export class AI2 {
    // 0 ว่าง 1 ดำ 2 ขาว
    public gameLogic:GameLogic;

    constructor(gameLogic: GameLogic) {
        this.gameLogic = new GameLogic(gameLogic.getBoard());
    }

    //First function will be called here
    public ai2Called(color: number) {
        var pos = this.test(color);
        // return {row, col}
        return pos;

        // var testObj = new GameLogic(this.gameLogic.getBoard());
        // testObj.move(1,2,1)
    }

    private test(color: number) {        
        for (let row = 7; row > -1; row--) {
            for (let col = 7; col > -1; col--) {
                if(this.gameLogic.canClickSpot(row, col, color)) {
                    return {row, col};
                }
            }
        }
    }
}