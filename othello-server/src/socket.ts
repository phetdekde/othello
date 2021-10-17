import { useSocketServer } from "socket-controllers";
import { Server } from "socket.io";

export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["content-type"],
    },
  });

  useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });

  return io;
};
