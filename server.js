import app from "./app.js";
import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://ginstore.netlify.app","http://localhost:5173", "http://localhost:5174"], // ✅ Match your frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
export default io;
