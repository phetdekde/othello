import { Socket } from "socket.io-client";
import { IPlayMatrix, IStartGame } from "../../components/game";

//พวก service จะเกี่ยวับ socket.io อย่าง emit กับ on
class GameService {
    public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
        return new Promise((rs, rj) => {
            socket.emit('join_game', { roomId }); // .emit คือส่ง , อันนี้จะส่ง message ไปให้ server ว่า roomId ชื่ออะไร
            socket.on('room_joined', () => rs(true)); // .on จะเป็นตัวรับ message
            socket.on('room_join_error', ({error}) => rj(error));
        });
    }

    public async updateGame(socket: Socket, gameMatrix: IPlayMatrix) {
        socket.emit('update_game', { matrix: gameMatrix });
    }

    public async onGameUpdate(socket: Socket, listener: (matrix: IPlayMatrix) => void) {
        socket.on('on_game_update', ({ matrix }) => listener(matrix));
    }

    public async onStartGame(socket: Socket, listener: (options: IStartGame) => void) {
        socket.on('start_game', listener);
    }

    public async gameWin(socket: Socket, message: string) {
        socket.emit('game_win', { message });
    }

    public async onGameWin(socket: Socket, listener: (message: string) => void) {
        socket.on('on_game_win', ({ message }) => listener(message));
    }

    public async onDisconnect(socket: Socket, listener: (message: string) => void) {
        socket.on('left_the_game', ({ message }) => listener(message));
    }
}

export default new GameService();