import { connect } from "http2";
import { ConnectedSocket, MessageBody, OnDisconnect, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class RoomController {
    private getSocketGameRoom(socket: Socket): string {
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);
        const gameRoom = socketRooms && socketRooms[0];
        return gameRoom;
    }

    private async roomJoined(socket: Socket, message: any, connectedSockets: Set<String>) {
        await socket.join(message.roomId);
        socket.emit("room_joined");

        console.log('------------------------------------------------------\nRoom member = ',
            Array.from(connectedSockets),
            '\n------------------------------------------------------\n\n');

        if (connectedSockets.size === 2) {
            const gameRoom = this.getSocketGameRoom(socket);
            socket.emit('ready_to_start');
            socket.to(gameRoom).emit('ready_to_start');
        }
    }

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
            /*
                if player enter the roomId in the input field by themselves
                    create or join room
                else
                    if room doesn't exists yet
                        they can't create and join room
                    else
                        join room
            */
            if(!message.joinFromRoomlist) {
                this.roomJoined(socket, message, connectedSockets);
            } else {
                
                var clients = Array.from(await io.sockets.allSockets());
                var rooms = Array.from(io.sockets.adapter.rooms.keys()).filter((r) => !clients.includes(r));
                
                if(!rooms.includes(message.roomId)) {
                    //Room doesn't exists, cannot join
                    socket.emit('room_join_error', {
                        error: "Room doesn't exists :("
                    });
                } else {
                    //Room exists, can join
                    this.roomJoined(socket, message, connectedSockets);
                }
            }
        }
    }
}