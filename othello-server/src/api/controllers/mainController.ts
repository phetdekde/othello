import { ConnectedSocket, OnConnect, SocketController } from "socket-controllers";
import { Socket } from 'socket.io';

@SocketController()
export class MainController {
    @OnConnect()
    public onConnection(
        @ConnectedSocket() socket: Socket
    ) {
        console.log('+ New socket connected: ', socket.id);

        socket.once('disconnecting', function() { 
            console.log('- Socket disconnected: ', socket.id)
            let socketRoom = Array.from(socket.rooms).filter((r) => r !== socket.id)[0]
            socket.to(socketRoom).emit('left_the_game', { message: 'Your opponent cry and left the game. :('});
        })
    }
}