import express from 'express';
import { getDailyStats, getWeeklyStats, getMonthlyStats, getOverviewStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/daily', protect, getDailyStats);
router.get('/weekly', protect, getWeeklyStats);
router.get('/monthly', protect, getMonthlyStats);
router.get('/overview', protect, getOverviewStats);

export default router;
