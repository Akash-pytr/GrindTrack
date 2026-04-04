import Room from '../models/Room.js';

// Create a custom room
export const createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;
    const userId = req.user._id;

    if (!roomName || !roomName.trim()) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    // Generate unique room ID
    const roomId = `custom-${roomName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

    // Create room with camera and screen share enabled for custom rooms
    const room = new Room({
      roomId,
      name: roomName,
      roomType: 'custom',
      createdBy: userId,
      permissions: {
        canEnableCamera: true,
        canScreenShare: true,
      },
    });

    const savedRoom = await room.save();
    
    // Broadcast new room to all connected clients
    if (req.io) {
      req.io.emit('custom-room-created', {
        roomId: savedRoom.roomId,
        name: savedRoom.name,
        createdBy: savedRoom.createdBy,
      });
    }
    
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

// Get all custom rooms created by user
export const getUserCustomRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const rooms = await Room.find({
      createdBy: userId,
      roomType: 'custom',
    }).sort({ createdAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching user rooms:', error);
    res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
  }
};

// Get all active custom rooms (visible to all users)
export const getAllActiveCustomRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      roomType: 'custom',
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching active custom rooms:', error);
    res.status(500).json({ message: 'Failed to fetch active rooms', error: error.message });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await Room.findOneAndDelete({ roomId });

    if (!result) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Failed to delete room', error: error.message });
  }
};

// Get room details with permissions
export const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId }).populate('createdBy', 'name email');

    if (!room) {
      // Return default permissions for predefined rooms
      return res.json({
        roomId,
        name: roomId,
        roomType: 'predefined',
        permissions: {
          canEnableCamera: true,
          canScreenShare: true,
        },
      });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Failed to fetch room', error: error.message });
  }
};

// Check if user can enable camera/screen share in a room
export const checkPermissions = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({ roomId });

    // If no room found (predefined room), return allowed permissions
    if (!room) {
      return res.json({
        canEnableCamera: true,
        canScreenShare: true,
        isCustom: false,
      });
    }

    // Check if user is the creator
    const isCreator = room.createdBy.toString() === userId.toString();

    res.json({
      canEnableCamera: true, // Always allowed to enable time tracking
      canScreenShare: true,  // Always allowed to enable time tracking
      isCustom: room.roomType === 'custom',
      isCreator,
    });
  } catch (error) {
    console.error('Error checking permissions:', error);
    res.status(500).json({ message: 'Failed to check permissions', error: error.message });
  }
};
