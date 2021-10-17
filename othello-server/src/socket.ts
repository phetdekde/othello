import { useSocketServer } from "socket-controllers";
import { Server } from "socket.io";

export default (httpServer) => {
  const io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  io.attach(httpServer)

  useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });

  return io;
};
