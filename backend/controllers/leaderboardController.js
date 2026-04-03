import User from '../models/User.js';
import Session from '../models/Session.js';

export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await Session.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$userId',
          totalStudyTime: { $sum: '$activeTime' },
          totalDistractions: { $sum: '$distractionCount' },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { totalStudyTime: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalStudyTime: 1,
          totalDistractions: 1,
          sessionCount: 1,
          name: '$user.name',
          level: '$user.level',
          currentStreak: '$user.currentStreak',
          medals: '$user.medals'
        }
      }
    ]);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboardWithComparison = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get top 10 users plus current user's stats
    const topUsers = await Session.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$userId',
          totalStudyTime: { $sum: '$activeTime' },
          totalDistractions: { $sum: '$distractionCount' },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { totalStudyTime: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalStudyTime: 1,
          totalDistractions: 1,
          sessionCount: 1,
          name: '$user.name',
          level: '$user.level',
          currentStreak: '$user.currentStreak',
          medals: '$user.medals'
        }
      }
    ]);

    // Get current user stats
    const currentUserStats = topUsers.find(u => u._id.toString() === currentUserId.toString());
    const currentUserRank = topUsers.findIndex(u => u._id.toString() === currentUserId.toString()) + 1;

    res.json({
      leaderboard: topUsers.slice(0, 10),
      currentUserStats: currentUserStats || {},
      currentUserRank: currentUserRank || topUsers.length + 1
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
