import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { staggerContainer, cardItem } from '../utils/animations';
import { Link } from 'react-router-dom';
import { Maximize2, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
        className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2 transition-colors">
            <Link to="/" className="hover:text-slate-800 dark:hover:text-white transition-colors">Dashboards</Link> &gt; Data
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Advanced Analytics</h1>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
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
        
        <motion.div variants={cardItem} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group col-span-1 lg:col-span-2 transition-colors duration-300">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">Weekly Progress Trace</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Focus minutes logged over the last 7 days</p>
            </div>
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Maximize2 size={18} />
            </button>
          </div>
          
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={isDarkMode ? 0.2 : 0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#cbd5e1' : '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#cbd5e1' : '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: isDarkMode ? '1px solid #1e293b' : 'none', 
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#000000',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ color: '#ea580c' }}
                  cursor={{ stroke: isDarkMode ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalTimeMins" 
                  stroke="#ea580c" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorFocus)" 
                  activeDot={{ r: 8, fill: '#f97316', stroke: isDarkMode ? '#1e293b' : '#fff', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={cardItem} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">Today's Breakdown</h3>
          
          <div className="space-y-8 mt-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-600 dark:text-slate-400 font-semibold transition-colors">Total Study Time</span>
                <span className="font-extrabold text-slate-800 dark:text-white transition-colors">{Math.round(dailyStats?.totalActiveTime / 60)} mins</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner dark:shadow-none flex transition-colors">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((dailyStats?.totalActiveTime / 14400) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-brand-500 rounded-full" 
                ></motion.div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((dailyStats?.totalActiveTime / 28800) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  className="h-full bg-brand-200 dark:bg-brand-500/30 rounded-r-full transition-colors" 
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-600 dark:text-slate-400 font-semibold transition-colors">Focus Score Matrix</span>
                <span className="font-extrabold text-slate-800 dark:text-white transition-colors">{dailyStats?.focusScore}/100</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner dark:shadow-none transition-colors">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyStats?.focusScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className={`h-full rounded-full ${dailyStats?.focusScore > 80 ? 'bg-emerald-500' : dailyStats?.focusScore > 50 ? 'bg-amber-400' : 'bg-red-500'}`} 
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardItem} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">Distraction Insights</h3>
          
          <div className="flex items-center justify-center mt-6">
             <div className="relative w-48 h-48 rounded-full border-[12px] border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-inner dark:shadow-none transition-colors">
               <motion.svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <motion.circle 
                    cx="50" cy="50" r="44" fill="none" stroke="#ef4444" strokeWidth="12" 
                    strokeDasharray="276.46"
                    strokeDashoffset={276.46 * (1 - Math.min(dailyStats?.distractions / 20, 1))}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 276.46 }}
                    animate={{ strokeDashoffset: 276.46 * (1 - Math.min(dailyStats?.distractions / 20, 1)) }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                  />
               </motion.svg>
               <div className="text-center absolute">
                 <div className="text-4xl font-black text-slate-800 dark:text-white transition-colors">{dailyStats?.distractions}</div>
                 <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 transition-colors">Taps</div>
               </div>
             </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
