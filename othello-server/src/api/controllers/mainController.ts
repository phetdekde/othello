import { ConnectedSocket, OnConnect, SocketController } from "socket-controllers";
import { Socket, Server } from 'socket.io';

@SocketController()
export class MainController {
    @OnConnect()
    public onConnection(@ConnectedSocket() socket: Socket) {
        console.log('+ New socket connected: ', socket.id);
    }
}