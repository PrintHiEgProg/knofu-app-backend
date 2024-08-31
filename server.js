const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://conference-app-ten.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

const rooms = {};
const conferences = {};

app.get("/", (req, res) => {
  res.send("Это бэкенд!");
});


app.post("/create-conference", (req, res) => {
  const { roomID, conferenceName } = req.body;
  conferences[roomID] = { name: conferenceName, admin: "Имя администратора" };
  io.emit("new-conference", { roomID, conferenceName });
  res.json({ message: "Конференция создана" });
});

// Обработка удаления конференции
app.delete("/delete-conference/:roomID", (req, res) => {
  const roomID = req.params.roomID;
  if (conferences[roomID]) {
    delete conferences[roomID];
    io.emit("delete-conference", roomID);
    res.json({ message: "Конференция удалена" });
  } else {
    res.status(404).json({ message: "Конференция не найдена" });
  }
});

// Обработка подключения клиента
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.emit("conferences", conferences);

  //Chat
  // Присоединение к комнате
  socket.on("joinRoom", ({ roomID }) => {
    socket.join(roomID);
    console.log(`User joined room: ${roomID}`);

    // Отправка сообщения о новом пользователе
    socket
      .to(roomID)
      .emit("message", { user: "admin", text: `${socket.id} has joined!` });
  });

  // Обработка сообщений
  socket.on("sendMessage", ({ roomID, message }) => {
    io.to(roomID).emit("message", { user: socket.id, text: message });
  });

  // Обработка отключения
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    const roomID = rooms[socket.id];
    if (roomID) {
      // check if the admin was the last one to leave the conference
      if (!io.sockets.adapter.rooms.get(roomID).size) {
        
        delete conferences[roomID];
        io.emit('delete-conference', roomID);
      }
    }
    delete rooms[socket.id];
  
  });
});

// Запуск сервера
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
