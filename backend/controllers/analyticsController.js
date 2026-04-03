import Session from '../models/Session.js';
import User from '../models/User.js';

// Helper function to calculate stats for a date range
const getStatsForDateRange = async (userId, startDate, endDate) => {
  const sessions = await Session.find({
    userId,
    startTime: { $gte: startDate, $lt: endDate },
    status: 'completed'
  });

  const totalTime = sessions.reduce((acc, curr) => acc + curr.activeTime, 0);
  const totalDistractions = sessions.reduce((acc, curr) => acc + curr.distractionCount, 0);
  const focusScore = Math.max(0, 100 - (totalDistractions * 5));

  return { totalTime, totalDistractions, focusScore, sessionCount: sessions.length };
};

export const getDailyStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    const [todayStats, yesterdayStats] = await Promise.all([
      getStatsForDateRange(req.user._id, today, tomorrow),
      getStatsForDateRange(req.user._id, yesterday, today)
    ]);

    // Calculate percentage changes
    const timeChangePercent = yesterdayStats.totalTime > 0 
      ? ((todayStats.totalTime - yesterdayStats.totalTime) / yesterdayStats.totalTime * 100).toFixed(2)
      : 0;
    
    const distractionChangePercent = yesterdayStats.totalDistractions > 0
      ? ((todayStats.totalDistractions - yesterdayStats.totalDistractions) / yesterdayStats.totalDistractions * 100).toFixed(2)
      : 0;

    const scoreChangePercent = yesterdayStats.focusScore > 0
      ? ((todayStats.focusScore - yesterdayStats.focusScore) / yesterdayStats.focusScore * 100).toFixed(2)
      : 0;

    res.json({
      today: {
        totalActiveTime: todayStats.totalTime,
        distractions: todayStats.totalDistractions,
        focusScore: todayStats.focusScore,
        sessionCount: todayStats.sessionCount
      },
      yesterday: {
        totalActiveTime: yesterdayStats.totalTime,
        distractions: yesterdayStats.totalDistractions,
        focusScore: yesterdayStats.focusScore,
        sessionCount: yesterdayStats.sessionCount
      },
      changes: {
        timeChangePercent: parseFloat(timeChangePercent),
        distractionChangePercent: parseFloat(distractionChangePercent),
        scoreChangePercent: parseFloat(scoreChangePercent)
      },
      user: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        level: user.level,
        totalXP: user.totalXP,
        medals: user.medals,
        dailyFocusGoal: user.dailyFocusGoal,
        distractionGoal: user.distractionGoal
      }
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

    const twoWeeksAgo = new Date(sevenDaysAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sessions = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: sevenDaysAgo, $lte: today },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          totalTime: { $sum: "$activeTime" },
          totalDistractions: { $sum: "$distractionCount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const prevWeekSessions = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: twoWeeksAgo, $lt: sevenDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalTime: { $sum: "$activeTime" },
          totalDistractions: { $sum: "$distractionCount" }
        }
      }
    ]);

    const currentWeekTotal = sessions.reduce((acc, s) => acc + s.totalTime, 0);
    const prevWeekTotal = prevWeekSessions[0]?.totalTime || 0;

    const weekChangePercent = prevWeekTotal > 0 
      ? ((currentWeekTotal - prevWeekTotal) / prevWeekTotal * 100).toFixed(2)
      : 0;

    res.json({
      week: sessions,
      currentWeekTotal,
      prevWeekTotal,
      weekChangePercent: parseFloat(weekChangePercent)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const sixtyDaysAgo = new Date(thirtyDaysAgo);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sessions = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: thirtyDaysAgo, $lte: today },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          totalTime: { $sum: "$activeTime" },
          totalDistractions: { $sum: "$distractionCount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const prevMonthSessions = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalTime: { $sum: "$activeTime" },
          totalDistractions: { $sum: "$distractionCount" }
        }
      }
    ]);

    const currentMonthTotal = sessions.reduce((acc, s) => acc + s.totalTime, 0);
    const prevMonthTotal = prevMonthSessions[0]?.totalTime || 0;

    const monthChangePercent = prevMonthTotal > 0 
      ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal * 100).toFixed(2)
      : 0;

    res.json({
      month: sessions,
      currentMonthTotal,
      prevMonthTotal,
      monthChangePercent: parseFloat(monthChangePercent)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOverviewStats = async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let stats = [];
    let dateRange = [];

    if (period === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Generate all dates for the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(date.getDate() + i);
        dateRange.push(date.toISOString().split('T')[0]);
      }

      const rawStats = await Session.aggregate([
        { $match: { userId: req.user._id, startTime: { $gte: sevenDaysAgo }, status: 'completed' } },
        { 
          $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } }, 
            totalTime: { $sum: "$activeTime" }, 
            totalDistractions: { $sum: "$distractionCount" } 
          } 
        },
        { $sort: { _id: 1 } }
      ]);

      // Fill missing dates with zero values
      stats = dateRange.map(date => {
        const found = rawStats.find(s => s._id === date);
        return found || { _id: date, totalTime: 0, totalDistractions: 0 };
      });
    } else if (period === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      // Generate all dates for the month
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(date.getDate() + i);
        dateRange.push(date.toISOString().split('T')[0]);
      }

      const rawStats = await Session.aggregate([
        { $match: { userId: req.user._id, startTime: { $gte: thirtyDaysAgo }, status: 'completed' } },
        { 
          $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } }, 
            totalTime: { $sum: "$activeTime" }, 
            totalDistractions: { $sum: "$distractionCount" } 
          } 
        },
        { $sort: { _id: 1 } }
      ]);

      // Fill missing dates with zero values
      stats = dateRange.map(date => {
        const found = rawStats.find(s => s._id === date);
        return found || { _id: date, totalTime: 0, totalDistractions: 0 };
      });
    } else {
      // For daily, return hourly breakdown - 24 hours of the day
      const hourlyData = [];
      
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = new Date(today);
        hourStart.setHours(hour, 0, 0, 0);
        
        const hourEnd = new Date(today);
        hourEnd.setHours(hour + 1, 0, 0, 0);

        const hourSessions = await Session.aggregate([
          { 
            $match: { 
              userId: req.user._id, 
              startTime: { $gte: hourStart, $lt: hourEnd }, 
              status: 'completed' 
            } 
          },
          { 
            $group: {
              _id: null,
              totalTime: { $sum: "$activeTime" },
              totalDistractions: { $sum: "$distractionCount" }
            }
          }
        ]);

        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        if (hourSessions.length > 0) {
          hourlyData.push({
            _id: hourLabel,
            totalTime: hourSessions[0].totalTime || 0,
            totalDistractions: hourSessions[0].totalDistractions || 0
          });
        } else {
          hourlyData.push({
            _id: hourLabel,
            totalTime: 0,
            totalDistractions: 0
          });
        }
      }

      stats = hourlyData;
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
