import express from 'express';
import { getLeaderboard, getLeaderboardWithComparison } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/comparison', protect, getLeaderboardWithComparison);

export default router;
