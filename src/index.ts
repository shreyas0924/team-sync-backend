import bodyParser from "body-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import authRoutes from "./routes/auth-route";
const app: Application = express();
const httpServer = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(httpServer);
interface ChatMessage {
  message: string;
}
const PORT = 4000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello world 123");
});

// Handle Socket.IO connections
io.on("connection", (socket: Socket) => {
  console.log("A user connected!");

  // Handle events emitted from the client (with type safety)
  socket.on("chat message", (msg) => {
    console.log("message:", msg.message);
    io.emit("chat message", msg); // Broadcast the message to all connected clients
  });

  // Handle socket disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
