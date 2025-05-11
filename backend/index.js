const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');

const authRoutes = require('./Routes/authRoutes');
const fileRoutes = require('./Routes/fileRoutes');
const chatRoutes = require('./Routes/chatRoutes');
const { verifyToken } = require('./Services/authServices');
const { handleSocketEvents } = require('./Services/chatHandler');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('Express + JavaScript Chat App Backend is running!');
});

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.split(" ")[1];

  if (token) {
    const userPayload = verifyToken(token);
    if (userPayload) {
      socket.user = userPayload;
      return next();
    }
  }
  console.log("Socket authentication failed for socket:", socket.id);
  next(new Error('Authentication error'));
});

io.on('connection', (socket) => {
  const user = socket.user;
  console.log(`A user connected: ${socket.id}, User ID: ${user?.id}, Username: ${user?.username}`);

  handleSocketEvents(socket, io);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}, User ID: ${user?.id}`);
  });
});

app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err.stack);
  res.status(500).json({ message: err.message || 'Something broke!' });
});

httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
