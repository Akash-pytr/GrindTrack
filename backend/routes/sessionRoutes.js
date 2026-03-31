import express from 'express';
import { startSession, stopSession, getUserSessions } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, startSession);
router.post('/stop', protect, stopSession);
router.get('/user/:id', protect, getUserSessions);

export default router;
