import { Socket } from "socket.io-client";
import { IPlayMatrix, IStartGame } from "../../components/game";

class GameService {
    // public async getRoomList(socket: Socket) {
    //     socket.emit('get_room_list');
    // }

    public async onGettingRoomList(socket: Socket, listener: (message: Array<string>) => void) {
        socket.on('on_getting_room_list', ({ message }) => listener(message));
    }

    public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
        return new Promise((rs, rj) => {
            socket.emit('join_game', { roomId });
            socket.on('room_joined', () => rs(true)); 
            socket.on('room_join_error', ({error}) => rj(error));
        });
    }

    public async onRoomJoined(socket: Socket, listener: () => void) {
        socket.on('ready_to_start', listener);
    }

    public async startGame(socket: Socket) {
        socket.emit('start_game');
    }

    public async onGameStart(socket: Socket, listener: (options: IStartGame) => void) {
        socket.on('on_game_start', listener);
    }

    public async updateGame(socket: Socket, gameMatrix: IPlayMatrix) {
        socket.emit('update_game', { matrix: gameMatrix });
    }

    public async onGameUpdate(socket: Socket, listener: (matrix: IPlayMatrix) => void) {
        socket.on('on_game_update', ({ matrix }) => listener(matrix));
    }

    public async resetGame(socket: Socket) {
        socket.emit('reset_game');
    }

    public async onGameReset(socket: Socket, listener: () => void) {
        socket.on('on_game_reset', listener);
    }

    public async onDisconnect(socket: Socket, listener: (message: string) => void) {
        socket.on('left_the_game', ({ message }) => listener(message));
    }
}

export default new GameService();