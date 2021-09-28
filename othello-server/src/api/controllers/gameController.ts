import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class GameController {
    private getSocketGameRoom(socket: Socket): string {
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);
        const gameRoom = socketRooms && socketRooms[0];
        return gameRoom;
    }

    @OnMessage('start_game')
    public startGame(
        @SocketIO() io: Server,
        @ConnectedSocket() socket: Socket
    ) {
        const gameRoom = this.getSocketGameRoom(socket);
        
        if(io.sockets.adapter.rooms.get(gameRoom).size === 2) { 

            let rand = Math.floor(Math.random() * 2);

            if(rand === 0) { 
                //to the sender
                socket.emit('on_game_start', { start: true, color: 1 }); 
                //to all clients in gameRoom EXCEPT the sender
                socket.to(gameRoom).emit('on_game_start', { start: false, color: 2}); 
            } else {
                socket.emit('on_game_start', { start: false, color: 2 });
                socket.to(gameRoom).emit('on_game_start', { start: true, color: 1});
            }
        }
    }

    @OnMessage('update_game')
    public async updateGame(
        @ConnectedSocket() socket: Socket,
        @MessageBody() message: any
    ) {
        const gameRoom = this.getSocketGameRoom(socket);
        socket.to(gameRoom).emit('on_game_update', message);
    }

    // @OnMessage('game_win')
    // public async gameWin(
    //     @ConnectedSocket() socket: Socket,
    //     @MessageBody() message: any
    // ) {
    //     const gameRoom = this.getSocketGameRoom(socket);
    //     socket.to(gameRoom).emit('on_game_win', message);
    // }

    @OnMessage('reset_game')
    public async resetGame(
        @ConnectedSocket() socket: Socket,
    ) {
        const gameRoom = this.getSocketGameRoom(socket);
        socket.to(gameRoom).emit('on_game_reset');
    } 
}