import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../utils/animations';
import AnimatedCounter from '../components/AnimatedCounter';

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
        className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
      />
    </div>
  );

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return { hrs, mins };
  };

  const rowVariant = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 18 } }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-5 mb-10">
        <motion.div 
          initial={{ scale: 0, rotate: -180, filter: 'blur(10px)' }}
          animate={{ scale: 1, rotate: 0, filter: 'blur(0px)' }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="p-4 bg-white/70 dark:bg-[#000000] backdrop-blur-xl shadow-xl shadow-yellow-500/10 border border-white/50 dark:border-[#27272a] dark:neon-border-orange rounded-2xl transition-colors duration-500"
        >
          <Trophy className="text-yellow-500 w-10 h-10 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-800 dark:text-white transition-colors duration-500 tracking-tight"
          >
            Hall of Fame
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-1 transition-colors duration-500 uppercase tracking-widest">Ranking the most dedicated scholars globally.</motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/60 dark:bg-[#000000] backdrop-blur-3xl border border-white/50 dark:border-[#27272a] dark:neon-border-orange rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden p-4 transition-colors duration-500"
      >
        {users.length === 0 ? (
          <div className="p-16 text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm">No data available yet. Start tracking to claim #1!</div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            {users.map((user, index) => {
              const time = formatTime(user.totalStudyTime);
              return (
              <motion.div 
                variants={rowVariant}
                whileHover={{ scale: 1.02 }}
                key={user._id} 
                className={`flex items-center justify-between p-6 rounded-3xl transition-all cursor-default 
                  ${index === 0 ? 'bg-gradient-to-r from-orange-500/10 to-yellow-500/5 dark:from-orange-500/20 dark:to-yellow-500/10 border border-orange-500/20 dark:border-orange-500/60 shadow-lg shadow-orange-500/5 dark:shadow-neon-orange' : 'bg-white/40 dark:bg-[#18181b]/50 hover:bg-white dark:hover:bg-[#18181b] border border-white/50 dark:border-[#27272a] shadow-sm hover:dark:shadow-neon-blue transition-all'}`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1), type: "spring", stiffness: 300, bounce: 0.6 }}
                    className={`w-16 h-16 flex items-center justify-center rounded-2xl font-black text-2xl shadow-lg
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-yellow-500/40 border border-yellow-200/50' : 
                        index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-white shadow-slate-400/30 dark:shadow-slate-600/20 border border-white/50' : 
                        index === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-600 text-white shadow-amber-600/30 dark:shadow-amber-900/20 border border-orange-200/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 transition-colors shadow-inner'}`}
                  >
                    {index === 0 ? <Crown size={32} fill="currentColor" strokeWidth={1} className="drop-shadow-md" /> : 
                     index === 1 ? <Medal size={32} strokeWidth={2} className="drop-shadow-sm" /> : 
                     index === 2 ? <Medal size={32} strokeWidth={2} className="drop-shadow-sm" /> : `#${index + 1}`}
                  </motion.div>

                  <div>
                    <h3 className={`font-black text-xl transition-colors tracking-tight ${index === 0 ? 'text-brand-600 dark:text-brand-400 drop-shadow-sm' : 'text-slate-800 dark:text-white'}`}>
                      {user.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 transition-colors">Elite Scholar</p>
                  </div>
                </div>

                <div className="text-right flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-800 dark:text-white font-sans tracking-tighter transition-colors">
                    <AnimatedCounter value={time.hrs} />
                    <span className="text-lg text-slate-400 dark:text-slate-500 font-bold ml-1 mr-2">H</span>
                    <AnimatedCounter value={time.mins} />
                    <span className="text-lg text-slate-400 dark:text-slate-500 font-bold ml-1">M</span>
                  </p>
                </div>
              </motion.div>
            )})}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
