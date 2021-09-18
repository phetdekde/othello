import { ConnectedSocket, MessageBody, OnDisconnect, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class RoomController {
    @OnMessage('join_game') //รอรับ message join_game (ฝั่ง server)
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

            if(io.sockets.adapter.rooms.get(message.roomId).size === 2) { //คนเริ่ม
                let rand = Math.floor(Math.random() * 2);
                //0 = x เริ่ม
                if(rand === 0) { 
                    socket.emit('start_game', { start: true, symbol: 'x' }); //ส่งให้ frontend
                    socket.to(message.roomId).emit('start_game', { start: false, symbol: 'o'}); //ส่งให้อีกคน
                } else {
                    socket.emit('start_game', { start: false, symbol: 'o' });
                    socket.to(message.roomId).emit('start_game', { start: true, symbol: 'x'});
                }

            }
        }

        socket.on('disconnecting', function() { //รอคน disconnect แล้วมันจะรัน
            let roomId = Array.from(socket.rooms.values()).filter((r) => r !== socket.id)[0]

            socket.to(roomId).emit('left_the_game', { message: 'Your opponent cry and left the game. :('}); //ส่งให้ front
        });
    }
}