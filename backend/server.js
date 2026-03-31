import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Add a root endpoint
app.get('/', (req, res) => res.send('API is running...'));

// Socket.io Real-time Logic for Virtual Study Rooms
const activeRooms = {}; // Format: { roomId: { name: "10th VC", users: Set() } }

io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // Request all active room counts (Lobby view)
  socket.on('get-lobby-state', () => {
    const roomCounts = {};
    for (const [roomId, data] of Object.entries(activeRooms)) {
      roomCounts[roomId] = data.users.size;
    }
    socket.emit('lobby-state', roomCounts);
  });

  // User joins a specific VC Room
  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    
    // Track user
    if (!activeRooms[roomId]) {
      activeRooms[roomId] = { users: new Set(), userNames: new Map() };
    }
    activeRooms[roomId].users.add(socket.id);
    activeRooms[roomId].userNames.set(socket.id, userName);

    // Notify others in room
    socket.to(roomId).emit('user-joined', { 
      id: socket.id, 
      name: userName,
      message: `${userName} just sat down to study.` 
    });

    // Send active user list to the person who joined
    const currentUsers = Array.from(activeRooms[roomId].userNames.entries()).map(([id, name]) => ({ id, name }));
    io.to(roomId).emit('room-users', currentUsers);
    
    // Broadcast lobby updates
    const roomCounts = {};
    for (const [rId, data] of Object.entries(activeRooms)) {
      roomCounts[rId] = data.users.size;
    }
    io.emit('lobby-state', roomCounts);
  });

  // Handle chat messages within a VC
  socket.on('send-message', ({ roomId, message, userName }) => {
    io.to(roomId).emit('receive-message', {
      id: Date.now(),
      sender: userName,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Handle exiting room or disconnecting
  const handleDisconnect = () => {
    for (const [roomId, roomData] of Object.entries(activeRooms)) {
      if (roomData.users.has(socket.id)) {
        const userName = roomData.userNames.get(socket.id) || 'Someone';
        roomData.users.delete(socket.id);
        roomData.userNames.delete(socket.id);
        
        socket.leave(roomId);
        
        socket.to(roomId).emit('user-left', { 
          id: socket.id, 
          message: `${userName} packed up and left.` 
        });

        // Update remaining users
        const remainingUsers = Array.from(roomData.userNames.entries()).map(([id, name]) => ({ id, name }));
        io.to(roomId).emit('room-users', remainingUsers);

        // Clean up empty custom rooms (except hardcoded base ones if we want to)
        if (roomData.users.size === 0) {
          delete activeRooms[roomId];
        }

        // Broadcast lobby updates
        const roomCounts = {};
        for (const [rId, data] of Object.entries(activeRooms)) {
          roomCounts[rId] = data.users.size;
        }
        io.emit('lobby-state', roomCounts);
      }
    }
  };

  socket.on('leave-room', handleDisconnect);
  socket.on('disconnect', handleDisconnect);
});

const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studytracker';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    httpServer.listen(PORT, () => console.log(`Server & Socket.io running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
