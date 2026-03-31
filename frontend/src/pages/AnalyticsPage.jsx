import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { staggerContainer, cardItem } from '../utils/animations';
import { Link } from 'react-router-dom';
import { Maximize2, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AnimatedCounter from '../components/AnimatedCounter';

export default function AnalyticsPage() {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [weeklyRes, dailyRes] = await Promise.all([
          api.get('/analytics/weekly'),
          api.get('/analytics/daily')
        ]);
        
        const formattedWeekly = weeklyRes.data.map(item => ({
          ...item,
          totalTimeMins: Math.round(item.totalTime / 60)
        }));
        
        setWeeklyStats(formattedWeekly);
        setDailyStats(dailyRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
        setLoading(false);
      }
    };
    fetchAnalytics();
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

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <div className="text-sm font-black text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2 transition-colors uppercase tracking-widest">
            <Link to="/" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Dashboards</Link> &gt; Data Trace
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white transition-colors">Advanced Analytics</h1>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/30"
        >
          <Download size={16} /> Export Data
        </motion.button>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        
        <motion.div variants={cardItem} className="bg-white/60 dark:bg-[#000000] border border-white/50 dark:border-[#27272a] dark:neon-border-orange p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group col-span-1 lg:col-span-2 transition-all duration-500 hover:shadow-2xl scanline">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white transition-colors tracking-tight">Weekly Progress Trace</h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 transition-colors">Focus minutes logged over the last 7 days</p>
            </div>
            <button className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-800/5 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
              <Maximize2 size={20} />
            </button>
          </div>
          
          <div className="h-96 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={isDarkMode ? 0.4 : 0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: 13, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: 13, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', 
                    backgroundColor: isDarkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
                    fontWeight: '900'
                  }}
                  itemStyle={{ color: '#ea580c', fontWeight: '900' }}
                  cursor={{ stroke: isDarkMode ? '#f97316' : '#cbd5e1', strokeWidth: 2, strokeDasharray: '6 6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalTimeMins" 
                  stroke="#ea580c" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorFocus)" 
                  activeDot={{ r: 8, fill: '#f97316', stroke: isDarkMode ? '#000000' : '#fff', strokeWidth: 3 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={cardItem} whileHover={{ y: -5 }} className="bg-white/60 dark:bg-[#000000] border border-white/50 dark:border-[#27272a] dark:neon-border-orange p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 scanline">
          <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white mb-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-4 transition-colors">Today's Breakdown</h3>
          
          <div className="space-y-8 mt-6">
             <div className="flex justify-between items-end mb-2">
                <span className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-xs transition-colors">Total Study Time</span>
                <span className="font-black text-2xl text-slate-800 dark:text-white transition-colors"><AnimatedCounter value={Math.round(dailyStats?.totalActiveTime / 60) || 0} /> <span className="text-sm font-bold text-slate-400">MINS</span></span>
              </div>
              <div className="h-4 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner flex transition-colors relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((dailyStats?.totalActiveTime / 14400) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full relative z-10 shadow-[0_0_20px_rgba(249,115,22,1)]" 
                ></motion.div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50 z-20 pointer-events-none"></div>
              </div>

            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-xs transition-colors">Focus Score Matrix</span>
                <span className="font-black text-2xl text-slate-800 dark:text-white transition-colors"><AnimatedCounter value={dailyStats?.focusScore || 0} /><span className="text-sm font-bold text-slate-400">/100</span></span>
              </div>
              <div className="h-4 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner transition-colors relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyStats?.focusScore || 0}%` }}
                  transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
                  className={`h-full rounded-full relative z-10 shadow-[0_0_15px_currentColor] ${dailyStats?.focusScore > 80 ? 'bg-emerald-500 text-emerald-500' : dailyStats?.focusScore > 50 ? 'bg-amber-400 text-amber-400' : 'bg-red-500 text-red-500'}`} 
                ></motion.div>
                 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50 z-20 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardItem} whileHover={{ y: -5 }} className="bg-white/60 dark:bg-[#000000] border border-white/50 dark:border-[#27272a] dark:neon-border-orange p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 flex flex-col items-center justify-center scanline">
          <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white mb-6 w-full text-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4 transition-colors">Distraction Insights</h3>
          
          <div className="flex items-center justify-center mt-6 flex-1 w-full relative">
             <div className="relative w-56 h-56 rounded-full bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] border-[12px] border-white/80 dark:border-slate-800/80 flex items-center justify-center transition-colors">
               <motion.svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <motion.circle 
                    cx="50" cy="50" r="44" fill="none" stroke="#ef4444" strokeWidth="12" 
                    className="filter drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                    strokeDasharray="276.46"
                    strokeDashoffset={276.46 * (1 - Math.min((dailyStats?.distractions || 0) / 20, 1))}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 276.46 }}
                    animate={{ strokeDashoffset: 276.46 * (1 - Math.min((dailyStats?.distractions || 0) / 20, 1)) }}
                    transition={{ duration: 2, ease: [0.34, 1.56, 0.64, 1], delay: 0.6 }}
                  />
               </motion.svg>
               <div className="text-center absolute z-20">
                 <div className="text-5xl font-black text-slate-800 dark:text-white transition-colors tracking-tighter">
                   <AnimatedCounter value={dailyStats?.distractions || 0} />
                 </div>
                 <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.3em] mt-2 transition-colors">Taps</div>
               </div>
             </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
