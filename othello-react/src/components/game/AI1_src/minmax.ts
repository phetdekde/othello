import { GameLogic } from "../gameLogic";

export class Minimax {

    public static hueristic(state: GameLogic, player: number): number{
        const opponent = player === 1? 2:1;

        // score
        const PSC = state.getScore(player);
        const OSC = state.getScore(opponent);
        const SCd = PSC + OSC;
        const SC = (PSC - OSC) / SCd;
        const cSC = 0.6719*Math.exp(0.0618 * SCd + 3.3723);
        
        // mobility
        const PMB = state.getMovableCell(player).length;
        const OMB = state.getMovableCell(opponent).length;
        const MBd =  PMB + OMB
        const MB = MBd === 0 ? 0 : (PMB - OMB) / MBd;
        const cMB = 500.3537*Math.exp(-3.1480*Math.pow((SCd- 40.0623), 2) / 4009.5622);
        
        // frontier
        const PFT = state.getFrontierDisc(player).length;
        const OFT = state.getFrontierDisc(opponent).length;
        const FTd = PFT + OFT;
        const FT = FTd === 0 ? 0 : (OFT - PFT) / FTd;
        const cFT = 450.0882*Math.exp(-3.1375 * Math.pow((SCd - 35.6129), 2) / 299.0685);
        
        // stablility
        const PST = state.getStableDisc(player).length;
        const OST = state.getStableDisc(opponent).length;
        const STd = PST + OST;
        const ST = STd === 0 ? 0 : (PST - OST) / STd;
        const cST = 561.5805*Math.exp((-1 * Math.pow((64 - SCd), 3.5) / 285326.4547));

        // board weighting
        
        const PBW = Minimax.boardweight(state, player, [
            [100, -10, 10, 8, 8, 10, -10, 100],
            [-10, -20, -5, -5, -5, -5, -20, -10],
            [10, -5, 8, 4, 4, 8, -5, 10],
            [8, -5, 4, 0, 0, 4, -5, 8],
            [8, -5, 4, 0, 0, 4, -5, 8],
            [10, -5, 8, 4, 4, 8, -5, 10],
            [-10, -20, -5, -5, -5, -5, -20, -10],
            [100, -10, 10, 8, 8, 10, -10, 100]
        ]);
        const OBW = Minimax.boardweight(state, opponent, [
            [100, -10, 10, 8, 8, 10, -10, 100],
            [-10, -20, -5, -5, -5, -5, -20, -10],
            [10, -5, 8, 4, 4, 8, -5, 10],
            [8, -5, 4, 0, 0, 4, -5, 8],
            [8, -5, 4, 0, 0, 4, -5, 8],
            [10, -5, 8, 4, 4, 8, -5, 10],
            [-10, -20, -5, -5, -5, -5, -20, -10],
            [100, -10, 10, 8, 8, 10, -10, 100]
        ]);
        const BWd = PBW + OBW;
        const BW = BWd === 0 ? 0 : (PBW - OBW) / BWd;
        const cBW = 92.8481*Math.log10((1.1276*SCd + 0.9270) + 107.0456)

        return cSC*SC + cMB*MB + cFT*FT + cST*ST + cBW*BW;
    }

    private static boardweight(state: GameLogic, player: number, wBoard: Array<Array<number>>) {
        let wscore = 0;
        for(let pos of state.getPos(player)) wscore += wBoard[pos[0]][pos[1]];
        return wscore;
    }

    private static MMAB(state: GameLogic, player: number, depth: number, max: boolean, alpha: number, beta: number): number {
        if(depth === 0 || state.isTerminal()) {
            return Minimax.hueristic(state, player);
        }
        let opponent = player === 1 ? 2:1;
        const pmovable = state.getMovableCell(player);
        const omovable = state.getMovableCell(opponent);
        if((max && pmovable.length === 0) || (!max && omovable.length === 0)) {
            return Minimax.MMAB(state, player, depth - 1, !max, alpha, beta);
        }
        let score : number;
        if(max){
            score = Number.MIN_SAFE_INTEGER;
            for(let move of pmovable) {
                let newstate = new GameLogic(state.getBoard());
                newstate.move(move[0], move[1], player);
                let childscore = Minimax.MMAB(newstate, player, depth - 1, false, alpha, beta);
                if(childscore > score) score = childscore;
                if(score > alpha) alpha = score;
                if(beta <= alpha) break;
            }
        } else {
            score = Number.MAX_SAFE_INTEGER;
            for(let move of omovable) {
                let newstate = new GameLogic(state.getBoard());
                newstate.move(move[0], move[1], opponent);
                let childscore = Minimax.MMAB(newstate, player, depth - 1, true, alpha, beta);
                if(childscore < score) score = childscore;
                if(score < beta) beta = score;
                if(beta <= alpha) break;
            }
        }
        return score;
    }

    public static solve(state: GameLogic, player: number, depth: number) {
        let bestscore = Number.MIN_SAFE_INTEGER;
        let bestmove = null;
        for(let move of state.getMovableCell(player)) {
            let newstate = new GameLogic(state.getBoard());
            newstate.move(move[0], move[1], player);
            let childscore = Minimax.MMAB(newstate, player, depth - 1, false, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
            if(childscore > bestscore) {
                bestscore = childscore;
                bestmove = move;
            }
        }
        return bestmove;
    }
}