import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { CheckSquare, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, cardItem } from '../utils/animations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const dummyChartData = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
  { name: 'Jul', income: 3490, expense: 4300 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/analytics/daily');
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stats', error);
        setLoading(false);
      }
    };
    fetchStats();
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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="py-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Your Study at a Glance</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors duration-300">Real-time snapshot of your focus, distractions, and goals.</p>
      </motion.div>
      
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Card 1 */}
        <motion.div variants={cardItem} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-600 dark:text-slate-400 font-semibold text-sm transition-colors">Focus Today</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
              <Eye size={18} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 transition-colors">{formatTime(stats?.totalActiveTime || 0)}</h2>
          <p className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 inline-block px-2 py-1 rounded-full">+5.50% from Yesterday</p>
          <div className="absolute -right-4 -bottom-4 bg-blue-50 dark:bg-blue-500/5 w-24 h-24 rounded-full blur-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
        </motion.div>

        {/* Card 2 */}
        <motion.div variants={cardItem} className="bg-emerald-50 dark:bg-slate-900/60 rounded-2xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-500/10 hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-emerald-800 dark:text-emerald-400 font-semibold text-sm transition-colors">Focus Score</h3>
            <div className="p-2 bg-white/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors">
              <CheckSquare size={18} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-emerald-900 dark:text-white mb-2 transition-colors">{stats?.focusScore || 0} / 100</h2>
          <p className="text-emerald-700 dark:text-emerald-500 text-xs font-semibold transition-colors">+6.20% from Yesterday</p>
          <div className="absolute right-0 bottom-0 top-0 w-32 bg-emerald-100/50 dark:bg-emerald-500/5 backdrop-blur-md -skew-x-12 opacity-50 transform translate-x-10 pointer-events-none transition-colors"></div>
        </motion.div>

        {/* Card 3 */}
        <motion.div variants={cardItem} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-600 dark:text-slate-400 font-semibold text-sm transition-colors">Distractions</h3>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg transition-colors">
              <Users size={18} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 transition-colors">{stats?.distractions || 0}</h2>
          <p className="text-red-500 dark:text-red-400 text-xs font-semibold bg-red-50 dark:bg-red-500/10 inline-block px-2 py-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis">-8.20% from Yesterday</p>
          <div className="absolute -right-4 -bottom-4 bg-purple-50 dark:bg-purple-500/5 w-24 h-24 rounded-full blur-2xl group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10 transition-colors pointer-events-none"></div>
        </motion.div>
      </motion.div>

      {/* Analytics Chart area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white transition-colors">Study Analytic</h3>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center text-xs text-slate-500 dark:text-slate-400 transition-colors"><span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> Focus Time</span>
              <span className="flex items-center text-xs text-slate-500 dark:text-slate-400 transition-colors"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span> Distractions</span>
            </div>
          </div>
          <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-lg px-4 py-2 outline-none font-medium transition-colors">
            <option>This Year</option>
            <option>Last Year</option>
          </select>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={isDarkMode ? 0.2 : 0.1}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={isDarkMode ? 0.2 : 0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#cbd5e1' : '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#cbd5e1' : '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: isDarkMode ? '1px solid #1e293b' : 'none', 
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#000000',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
                cursor={{ stroke: isDarkMode ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area type="monotone" dataKey="income" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
