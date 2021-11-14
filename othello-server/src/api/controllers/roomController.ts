import { ConnectedSocket, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class RoomController {
    private getSocketGameRoom(socket: Socket): string {
        const socketRooms = Array.from(socket.rooms.values()).filter((r) => r !== socket.id);
        const gameRoom = socketRooms && socketRooms[0];
        return gameRoom;
    }

    private async isRoomExisted(io: Server, message: any): Promise<boolean> {
        var clients = Array.from(await io.sockets.allSockets());
        var rooms = Array.from(io.sockets.adapter.rooms.keys()).filter((r) => !clients.includes(r));
        console.log(rooms)
        if(rooms.includes(message.roomId)) {
            return true;
        } else {
            return false;
        }
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

        //Is user creating or joining room?
        if (message.createRoom) {
            //CREATING
            if (await this.isRoomExisted(io, message)) {
                //Room exists, cannot create
                socket.emit('room_join_error', {
                    error: "Room name already exists, please try other name :("
                });
            } else {
                //Room doesn't exists, can create
                this.roomJoined(socket, message, connectedSockets);
            }
        } else {
            //JOINING
            if (await this.isRoomExisted(io, message)) {
                //Room exists...
                if (socketRooms.length > 0 || connectedSockets && connectedSockets.size === 2) {
                    //cannot join because not full
                    socket.emit('room_join_error', {
                        error: "Room is already full :("
                    });
                } else {
                    //can join because not full
                    this.roomJoined(socket, message, connectedSockets);
                }
            } else {
                //Room doesn't exists, cannot join
                socket.emit('room_join_error', {
                    error: "Room doesn't exists :("
                });
            }
        }
        
    }
}