import express from 'express';
import { getDailyStats, getWeeklyStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/daily', protect, getDailyStats);
router.get('/weekly', protect, getWeeklyStats);

export default router;
