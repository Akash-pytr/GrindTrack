import User from '../models/User.js';
import Session from '../models/Session.js';

export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await Session.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$userId',
          totalStudyTime: { $sum: '$activeTime' }
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
          name: '$user.name'
        }
      }
    ]);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
