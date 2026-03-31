import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../utils/animations';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div className="p-8 h-full flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"
      />
    </div>
  );

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const rowVariant = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="p-3 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-2xl transition-colors duration-300"
        >
          <Trophy className="text-yellow-500 w-8 h-8 drop-shadow-sm" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300"
          >
            Hall of Fame
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors duration-300">Ranking the most dedicated scholars globally.</motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-2 transition-colors duration-300"
      >
        {users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">No data available yet. Start tracking to claim #1!</div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {users.map((user, index) => (
              <motion.div 
                variants={rowVariant}
                whileHover={{ scale: 1.01 }}
                key={user._id} 
                className={`flex items-center justify-between p-6 rounded-2xl transition-all cursor-default hover:bg-slate-50 dark:hover:bg-slate-800/50 
                  ${index === 0 ? 'bg-orange-50 dark:bg-orange-500/5 border border-orange-100/50 dark:border-orange-500/10 shadow-sm' : 'border border-transparent'}`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + (index * 0.1), type: "spring", stiffness: 300 }}
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl font-extrabold text-xl shadow-sm
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-yellow-500/30' : 
                        index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-white shadow-slate-400/30 dark:shadow-slate-600/10' : 
                        index === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-600 text-white shadow-amber-600/30 dark:shadow-amber-900/10' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 transition-colors'}`}
                  >
                    {index === 0 ? <Crown size={28} fill="currentColor" /> : 
                     index === 1 ? <Medal size={28} /> : 
                     index === 2 ? <Medal size={28} /> : index + 1}
                  </motion.div>

                  <div>
                    <h3 className={`font-extrabold text-lg transition-colors ${index === 0 ? 'text-brand-600 dark:text-brand-500' : 'text-slate-700 dark:text-slate-200'}`}>
                      {user.name}
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium transition-colors">Top Contributor</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight transition-colors">
                    {formatTime(user.totalStudyTime)}
                  </p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 transition-colors">Total Focus</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
