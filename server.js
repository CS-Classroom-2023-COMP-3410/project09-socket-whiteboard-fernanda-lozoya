const http = require("http");
const { Server } = require("socket.io");

// Creates server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.IO server running");
});

// Attach Socket.IO to the server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

// Store board state in memory
let boardState = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send existing board state to new clients
  socket.emit("loadBoard", boardState);

  // 1) A user begins a new stroke path
  socket.on("beginPath", () => {

    boardState.push({ type: "beginPath" });


    socket.broadcast.emit("beginPath");
  });

  // 2) A user draws a line segment
  socket.on("draw", (data) => {
    
    boardState.push({ type: "draw", ...data });
    socket.broadcast.emit("draw", data);
  });

  // 3) A user clears the board
  socket.on("clear", () => {
    
    boardState.push({ type: "clear" });

    
    boardState = [{ type: "clear" }];

    io.emit("clear"); // Notify all clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
