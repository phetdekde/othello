import { ConnectedSocket, OnConnect, SocketController } from "socket-controllers";
import { Socket, Server } from 'socket.io';

@SocketController()
export class MainController {
    @OnConnect()
    public onConnection(@ConnectedSocket() socket: Socket) {
        console.log('+ New socket connected: ', socket.id);
        socket.on('custom_event', (data: any) => {
            console.log("Data: ", data);
        });
    }
}