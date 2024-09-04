const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

const rooms = {};
const conferences = {};

// Set up Express to serve static files from the 'public' folder
app.use(express.static('public'));

// Set up a route to handle WebSocket connections


// Set up Socket.IO to handle connections and relay video feeds
io.on('connection', (socket) => {
  console.log('Client connected');

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Handle video feeds from clients
  socket.on('video-feed', (stream) => {
    console.log('Received video feed from client');

    // Relay the video feed to other connected clients
    socket.broadcast.emit('video-feed', stream);
  });

  // Handle new clients joining the room
  

  // Handle clients leaving the room
  
});

// Set up a route to handle room creation


// Set up a route to handle room joining


// Set up a route to handle offer
app.post("/offer", (req, res) => {
  const offer = req.body;
  // Создаем ответ на основе оффера
  const answer = createAnswer(offer);
  res.json(answer);
});

// Set up a route to handle answer
app.get("/answer", (req, res) => {
  const answer = getAnswer();
  res.json(answer);
});

// Store the answer in a variable
let storedAnswer;

// Create answer based on offer
function createAnswer(offer) {
  // Создаем peer connection
  const pc = new RTCPeerConnection();

  // Устанавливаем оффер от клиента
  pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: offer }));

  // Создаем ответ
  pc.createAnswer().then((answer) => {
    return pc.setLocalDescription(new RTCSessionDescription({ type: "answer", sdp: answer }));
  }).then(() => {
    // Store the answer
    storedAnswer = pc.localDescription;
  });

 
  return pc.localDescription;
}

// Get answer
function getAnswer() {
  return storedAnswer;
}

// Start the server
server.listen(3001, () => {
  console.log('Server listening on port 3001');
});

// Generate a unique room ID
function generateRoomId() {
  return Math.random().toString(36).substr(2, 9);
}