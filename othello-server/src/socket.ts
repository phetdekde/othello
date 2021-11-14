import { useSocketServer } from "socket-controllers";
import { Server } from "socket.io";

export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
<<<<<<< HEAD
      // origin: "https://othello-react.netlify.app",
=======
      //origin: "https://othello-react.netlify.app",
>>>>>>> 1c506831d3d2e03f9af6317119a63b6f1ecf7c38
      origin: 'http://localhost:3000',
      methods: ["GET", "POST"],
    },
  });

  useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });

  return io;
};
