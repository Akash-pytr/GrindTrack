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
import roomRoutes from './routes/roomRoutes.js';
import Room from './models/Room.js';

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

// Attach io instance to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rooms', roomRoutes);

// Add a root endpoint
app.get('/', (req, res) => res.send('API is running...'));

// Socket.io Real-time Logic for Virtual Study Rooms
const activeRooms = {}; // Format: { roomId: { name: "10th VC", users: Set() } }
const broadcastLobbyState = () => {
    const roomCounts = {};
    for (const [roomId, data] of Object.entries(activeRooms)) {
      roomCounts[roomId] = data.users.size;
    }
    io.emit('lobby-state', roomCounts);
};

io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // Request all active room counts (Lobby view)
  socket.on('get-lobby-state', () => {
    console.log('Client requested lobby state:', socket.id);
    broadcastLobbyState();
  });

  // User joins a specific VC Room
  socket.on('join-room', ({ roomId, userName }) => {
    console.log(`User ${userName} (${socket.id}) joining room: ${roomId}`);
    socket.join(roomId);
    
    // Track user
    if (!activeRooms[roomId]) {
      // The first person to join a room becomes the owner
      activeRooms[roomId] = { users: new Set(), userNames: new Map(), ownerId: socket.id };
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
    io.to(roomId).emit('room-users', { users: currentUsers, ownerId: activeRooms[roomId].ownerId });
    
    // Broadcast lobby updates to everyone
    broadcastLobbyState();
  });

  // Relays signal (Offer/Answer/Candidate) to a specific remote peer for WebRTC
  socket.on('rtc-signal', ({ to, signal, from, fromName }) => {
    io.to(to).emit('rtc-signal', { from, signal, fromName });
  });

  // Moderator Power: Kick a user from the VC
  socket.on('kick-user', ({ roomId, targetId }) => {
    const room = activeRooms[roomId];
    if (room && room.ownerId === socket.id) {
       io.to(targetId).emit('kicked', { message: 'You have been removed from the room by the moderator.' });
       
       // Force disconnect the target from the room on the server side
       const targetSocket = io.sockets.sockets.get(targetId);
       if (targetSocket) {
          targetSocket.leave(roomId);
          handleDisconnectFromRoom(targetSocket, roomId);
       }
    }
  });

  // Common function to handle room exit/disconnect logic
  const handleDisconnectFromRoom = async (sock, roomId) => {
     const roomData = activeRooms[roomId];
     if (roomData && roomData.users.has(sock.id)) {
        console.log(`User ${sock.id} leaving room: ${roomId}`);
        const userName = roomData.userNames.get(sock.id) || 'Someone';
        roomData.users.delete(sock.id);
        roomData.userNames.delete(sock.id);
        
        sock.to(roomId).emit('user-left', { 
          id: sock.id, 
          message: `${userName} packed up and left.` 
        });

        // Update remaining users (and current owner)
        const remainingUsers = Array.from(roomData.userNames.entries()).map(([id, name]) => ({ id, name }));
        io.to(roomId).emit('room-users', { users: remainingUsers, ownerId: roomData.ownerId });

        // Clean up empty custom rooms and delete from database
        if (roomData.users.size === 0) {
          delete activeRooms[roomId];
          // Delete custom room from database when it becomes empty
          if (roomId.startsWith('custom-')) {
            try {
              await Room.findOneAndDelete({ roomId });
              console.log(`Custom room ${roomId} deleted from database`);
              // Broadcast room disposal to all clients
              io.emit('room-disposed', roomId);
            } catch (err) {
              console.error(`Error deleting room ${roomId} from database:`, err);
            }
          }
        }
        
        broadcastLobbyState();
     }
  };

  // Handle chat messages within a VC
  socket.on('send-message', ({ roomId, message, userName }) => {
    console.log(`Message from ${userName} in ${roomId}: ${message}`);
    io.to(roomId).emit('receive-message', {
      id: Date.now(),
      sender: userName,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Handle exiting room or disconnecting
  const handleDisconnect = () => {
    for (const roomId of Object.keys(activeRooms)) {
      handleDisconnectFromRoom(socket, roomId);
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
