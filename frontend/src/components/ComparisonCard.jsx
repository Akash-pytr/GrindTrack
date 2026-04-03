import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ComparisonCard({ user, currentUser, rank }) {
  const { isDarkMode } = useTheme();
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const isCurrentUser = currentUser && user._id === currentUser._id;
  const comparison = {
    focusTimePrefix: (user.totalStudyTime > currentUser?.totalStudyTime) ? '↑' : '↓',
    distractionPrefix: (user.totalDistractions < currentUser?.totalDistractions) ? '↑' : '↓',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`rounded-xl p-4 transition-all duration-300 border ${
        isCurrentUser
          ? isDarkMode
            ? 'bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
            : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-400/50 shadow-lg shadow-blue-500/10'
          : isDarkMode
          ? 'bg-zinc-900/50 border-zinc-700/50'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Rank Badge */}
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-white ${
            rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : rank === 3 ? 'bg-orange-600' : isDarkMode ? 'bg-zinc-700' : 'bg-slate-300'
          }`}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {user.name}
                {isCurrentUser && (
                  <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isDarkMode
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    You
                  </span>
                )}
              </h3>
              {user.medals && user.medals.length > 0 && (
                <div className="flex gap-1">
                  {user.medals.slice(0, 2).map((medal, idx) => (
                    <span key={idx} className="text-sm">{medal}</span>
                  ))}
                </div>
              )}
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Level {user.level} {user.currentStreak > 0 && `• 🔥 {user.currentStreak} streak`}
            </div>
          </div>
        </div>

        {/* Stats Display */}
        <div className="flex gap-4 ml-2">
          {/* Focus Time */}
          <div className="text-right">
            <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {formatTime(user.totalStudyTime)}
            </div>
            <div className={`text-xs ${
              comparison.focusTimePrefix === '↑' ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {comparison.focusTimePrefix}
            </div>
          </div>

          {/* Distractions */}
          <div className="text-right">
            <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {user.totalDistractions}
            </div>
            <div className={`text-xs ${
              comparison.distractionPrefix === '↑' ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {comparison.distractionPrefix}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
