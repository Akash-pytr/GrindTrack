import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Eye, Target, Zap, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../utils/animations';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/StatCard';
import AnalyticsChart from '../components/AnalyticsChart';
import ComparisonCard from '../components/ComparisonCard';

export default function Dashboard() {
  const [dailyStats, setDailyStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const { isDarkMode } = useTheme();
  const [chartPeriod, setChartPeriod] = useState('day');

  // Initial fetch for daily stats and leaderboard
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [dailyRes, leaderboardRes] = await Promise.all([
          api.get('/analytics/daily'),
          api.get('/leaderboard/comparison')
        ]);
        
        setDailyStats(dailyRes.data);
        setLeaderboardData(leaderboardRes.data);
      } catch (error) {
        console.error('Failed to fetch initial stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Separate effect for chart data based on period change
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const overviewRes = await api.get(`/analytics/overview?period=${chartPeriod}`);
        setChartData(overviewRes.data || []);
      } catch (error) {
        console.error('Failed to fetch chart data', error);
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [chartPeriod]);

  const handlePeriodChange = (period) => {
    setChartPeriod(period);
  };

  if (loading) return (
    <div className="p-8 h-full flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className={`w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full ${
          isDarkMode ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''
        }`}
      />
    </div>
  );

  const todayStats = dailyStats?.today || {};
  const userStats = dailyStats?.user || {};
  const changes = dailyStats?.changes || {};

  const getMedalIcon = (level) => {
    if (level >= 10) return '👑';
    if (level >= 7) return '⭐';
    if (level >= 5) return '🏅';
    return '🎯';
  };

  const formatTime = (seconds) => {
    return Math.floor(seconds / 60);
  };

  const getChangeColor = (percent) => {
    if (percent > 0) return 'text-emerald-500 dark:text-emerald-400';
    if (percent < 0) return 'text-red-500 dark:text-red-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  const getChangePrefix = (percent) => {
    if (percent > 0) return `+${percent.toFixed(1)}%`;
    if (percent < 0) return `${percent.toFixed(1)}%`;
    return 'No change';
  };

  return (
    <div className={`py-8 pt-20 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className={`text-3xl font-black transition-colors tracking-tight ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>Your Study at a Glance</h1>
        <p className={`font-medium mt-1 transition-colors ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>Real-time snapshot of your focus, distractions, and goals.</p>
      </motion.div>

      {/* Top Stats Cards - 3 Column Grid */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Focus Time Card */}
        <StatCard
          title="Focus Minutes"
          value={formatTime(todayStats.totalActiveTime || 0)}
          unit="m"
          icon={Eye}
          backgroundColor="bg-white"
          darkBgColor="dark:bg-black"
          borderColor="border-slate-200"
          darkBorderColor="dark:border-zinc-800"
          textColor="text-slate-800"
          darkTextColor="dark:text-white"
          subtitle={getChangePrefix(changes.timeChangePercent || 0) + ' from Yesterday'}
          badgeColor={getChangeColor(changes.timeChangePercent || 0)}
          streak={userStats.currentStreak || 0}
          goal={`${userStats.dailyFocusGoal || 60} min`}
        />

        {/* Focus Score Card */}
        <StatCard
          title="Focus Score"
          value={Math.round(todayStats.focusScore || 0)}
          maxValue="100"
          icon={Medal}
          backgroundColor="bg-linear-to-br from-emerald-500/5 to-teal-500/0"
          darkBgColor="dark:from-emerald-950/20 dark:to-teal-950/0"
          borderColor="border-slate-200 hover:border-emerald-500/50"
          darkBorderColor="dark:border-zinc-800 dark:hover:border-emerald-500/50"
          textColor="text-emerald-900"
          darkTextColor="dark:text-white"
          subtitle={getChangePrefix(changes.scoreChangePercent || 0) + ' from Yesterday'}
          badgeColor="text-emerald-600 dark:text-emerald-500"
          medalIcon={getMedalIcon(userStats.level || 1)}
        />

        {/* Distractions Card */}
        <StatCard
          title="Distractions"
          value={todayStats.distractions || 0}
          icon={Zap}
          backgroundColor="bg-white"
          darkBgColor="dark:bg-black"
          borderColor="border-slate-200"
          darkBorderColor="dark:border-zinc-800"
          textColor="text-slate-800"
          darkTextColor="dark:text-white"
          subtitle={getChangePrefix(changes.distractionChangePercent || 0) + ' from Yesterday'}
          badgeColor={getChangeColor(-changes.distractionChangePercent || 0)}
          goal={`Goal: < ${userStats.distractionGoal || 5}`}
        />
      </motion.div>

      <div className='w-full flex items-start gap-2'>
        {/* Analytics Chart */}
      <AnalyticsChart 
        data={chartData} 
        loading={chartLoading}
        onPeriodChange={handlePeriodChange} className={'flex-1'}
      />

      {/* Leaderboard & Comparison Section */}
      {leaderboardData && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
          className={`w-2/6 rounded-2xl p-8 shadow-lg dark:shadow-none border ${
            isDarkMode ? 'bg-black border-zinc-800' : 'bg-white border-slate-200'
          } transition-colors duration-500`}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🏆</span>
            <h3 className={`text-xl font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>
              Community Leaderboard
            </h3>
          </div>

          <div className={`text-sm font-semibold mb-4 p-3 rounded-lg ${
            isDarkMode ? 'bg-blue-950/30 text-blue-300' : 'bg-blue-50 text-blue-700'
          }`}>
            Your Rank: <span className="text-lg font-bold">#{leaderboardData.currentUserRank}</span> • 
            Total Focus Time: <span className="text-lg font-bold">
              {Math.floor((leaderboardData.currentUserStats?.totalStudyTime || 0) / 3600)}h {Math.floor(((leaderboardData.currentUserStats?.totalStudyTime || 0) % 3600) / 60)}m
            </span>
          </div>

          <div className="space-y-3">
            {leaderboardData.leaderboard?.map((user, idx) => (
              <ComparisonCard
                key={user._id}
                user={user}
                currentUser={leaderboardData.currentUserStats}
                rank={idx + 1}
              />
            ))}
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
