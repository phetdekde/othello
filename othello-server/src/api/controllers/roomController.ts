import { ConnectedSocket, MessageBody, OnDisconnect, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class RoomController {
    @OnMessage('join_game')
    public async joinGame(
        @SocketIO() io: Server,
        @ConnectedSocket() socket: Socket,
        @MessageBody() message: any
    ) {
        console.log('\n\n======================================================\n',
                    socket.id, " is joining room ",
                    '"', message.roomId, '"');

        const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);
    
        if(socketRooms.length > 0 || connectedSockets && connectedSockets.size === 2) {
            socket.emit('room_join_error', {
                error: "Room is already full :("
            });
        } else {
            await socket.join(message.roomId);
            socket.emit("room_joined");

            console.log('------------------------------------------------------\nRoom member = ', 
                        Array.from(io.sockets.adapter.rooms.get(message.roomId)),
                        '\n------------------------------------------------------\n\n');

            if(io.sockets.adapter.rooms.get(message.roomId).size === 2) { 
                let rand = Math.floor(Math.random() * 2);

                if(rand === 0) { 
                    socket.emit('start_game', { start: true, color: 1 }); 
                    socket.to(message.roomId).emit('start_game', { start: false, color: 2}); 
                } else {
                    socket.emit('start_game', { start: false, color: 1 });
                    socket.to(message.roomId).emit('start_game', { start: true, color: 2});
                }

            }
        }

        socket.on('disconnecting', function() { 
            let socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id)[0]

            socket.to(socketRooms).emit('left_the_game', { message: 'Your opponent cry and left the game. :('});
        });
    }
}