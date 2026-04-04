import express from 'express';
import { createRoom, getUserCustomRooms, getAllActiveCustomRooms, getRoom, checkPermissions, deleteRoom } from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new custom room
router.post('/create', protect, createRoom);

// Get all custom rooms created by user
router.get('/my-rooms', protect, getUserCustomRooms);

// Get all active custom rooms (visible to all users)
router.get('/active', getAllActiveCustomRooms);

// Check user permissions for camera/screen share
router.get('/:roomId/permissions', protect, checkPermissions);

// Get room details with permissions
router.get('/:roomId', protect, getRoom);

// Delete a room
router.delete('/:roomId', deleteRoom);

export default router;
