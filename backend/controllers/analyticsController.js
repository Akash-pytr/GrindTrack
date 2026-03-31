import Session from '../models/Session.js';

export const getDailyStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await Session.find({
      userId: req.user._id,
      startTime: { $gte: today },
      status: 'completed'
    });

    const totalTime = sessions.reduce((acc, curr) => acc + curr.activeTime, 0);
    const totalDistractions = sessions.reduce((acc, curr) => acc + curr.distractionCount, 0);

    // Calculate focus score: base 100, -5 per distraction
    const focusScore = Math.max(0, 100 - (totalDistractions * 5));

    res.json({
      totalActiveTime: totalTime,
      distractions: totalDistractions,
      focusScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWeeklyStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const sessions = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: sevenDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          totalTime: { $sum: "$activeTime" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
