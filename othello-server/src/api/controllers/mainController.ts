import { ConnectedSocket, OnConnect, SocketController, SocketIO, OnMessage } from "socket-controllers";
import { Server, Socket } from 'socket.io';

@SocketController()
export class MainController {
    @OnConnect()
    public async onConnection(
        @SocketIO() io: Server,
        @ConnectedSocket() socket: Socket
    ) {
        console.log('+ New socket connected: ', socket.id);

        var clients = Array.from(await io.sockets.allSockets());
        var rooms = Array.from(io.sockets.adapter.rooms.keys()).filter((r) => !clients.includes(r))
        var availableRooms = [];
        for (let i = 0; i < rooms.length; i++) {
            if(io.sockets.adapter.rooms.get(rooms[i]).size === 1) availableRooms.push(rooms[i]);
        }

        console.log(availableRooms)

        socket.emit('on_getting_room_list', {message: availableRooms});

        socket.once('disconnecting', function() { 
            console.log('- Socket disconnected: ', socket.id)
            let socketRoom = Array.from(socket.rooms).filter((r) => r !== socket.id)[0]
            socket.to(socketRoom).emit('left_the_game', { message: 'Your opponent cry and left the game. :('});
        })
    }

    // @OnMessage('get_room_list')
    // public async startGame(
    //     @SocketIO() io: Server,
    //     @ConnectedSocket() socket: Socket
    // ) {
    //     var clients = Array.from(await io.sockets.allSockets());
    //     var rooms = Array.from(io.sockets.adapter.rooms.keys()).filter((r) => !clients.includes(r))
    //     var availableRooms = [];
    //     for (let i = 0; i < rooms.length; i++) {
    //         if(io.sockets.adapter.rooms.get(rooms[i]).size === 1) availableRooms.push(rooms[i]);
    //     }

    //     console.log(availableRooms)

    //     socket.emit('on_getting_room_list', {message: availableRooms});
    // }
}