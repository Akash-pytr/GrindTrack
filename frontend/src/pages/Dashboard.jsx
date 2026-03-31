import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { CheckSquare, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, cardItem } from '../utils/animations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import AnimatedCounter from '../components/AnimatedCounter';

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
        className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
      />
    </div>
  );

  return (
    <div className="py-8 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-slate-800 dark:text-white transition-colors duration-500 tracking-tight">Your Study at a Glance</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors duration-500">Real-time snapshot of your focus, distractions, and goals.</p>
      </motion.div>
      
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Card 1 */}
        <motion.div variants={cardItem} whileHover={{ y: -5 }} className="bg-[#ffffff] dark:bg-[#000000] rounded-xl p-6 shadow-sm dark:shadow-none border border-[#e2e8f0] dark:border-[#27272a] dark:neon-border-orange transition-all duration-300 relative overflow-hidden group scanline">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-600 dark:text-slate-400 font-bold text-sm transition-colors">Focus Minutes</h3>
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-colors dark:shadow-neon-blue">
              <Eye size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white transition-colors tracking-tighter dark:neon-text-orange">
              <AnimatedCounter value={Math.floor((stats?.totalActiveTime || 0)/60)} />
            </h2>
            <span className="text-slate-400 dark:text-slate-500 font-bold">m</span>
          </div>
          <p className="text-emerald-500 dark:text-emerald-400 text-xs font-bold mt-2 inline-block transition-colors">+5.50% from Yesterday</p>
          <div className="absolute -right-4 -bottom-4 bg-blue-500/5 w-24 h-24 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors duration-700 pointer-events-none"></div>
        </motion.div>

        {/* Card 2 */}
        <motion.div variants={cardItem} whileHover={{ y: -5 }} className="bg-gradient-to-br from-emerald-500/5 to-teal-500/0 dark:from-emerald-950/20 dark:to-teal-950/0 rounded-xl p-6 shadow-sm dark:shadow-none border border-[#e2e8f0] dark:border-[#27272a] dark:neon-border-orange hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden group scanline">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-emerald-800 dark:text-emerald-400 font-bold text-sm transition-colors">Focus Score</h3>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors dark:shadow-neon-blue">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-4xl font-black text-emerald-900 dark:text-white transition-colors tracking-tighter dark:neon-text-orange">
              <AnimatedCounter value={stats?.focusScore || 0} />
            </h2>
            <span className="text-emerald-700/50 dark:text-emerald-400/50 font-bold text-xl">/ 100</span>
          </div>
          <p className="text-emerald-600 dark:text-emerald-500 text-xs font-bold mt-2 inline-block transition-colors">+6.20% from Yesterday</p>
        </motion.div>

        {/* Card 3 */}
        <motion.div variants={cardItem} whileHover={{ y: -5 }} className="bg-[#ffffff] dark:bg-[#000000] rounded-xl p-6 shadow-sm dark:shadow-none border border-[#e2e8f0] dark:border-[#27272a] dark:neon-border-orange transition-all duration-300 relative overflow-hidden group scanline">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-600 dark:text-slate-400 font-bold text-sm transition-colors">Distractions</h3>
            <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg transition-colors dark:shadow-neon-purple">
              <Users size={20} />
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 transition-colors tracking-tighter dark:neon-text-orange">
             <AnimatedCounter value={stats?.distractions || 0} />
          </h2>
          <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-2 inline-block transition-colors">-8.20% from Yesterday</p>
          <div className="absolute -right-4 -bottom-4 bg-purple-500/5 w-24 h-24 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors duration-700 pointer-events-none"></div>
        </motion.div>
      </motion.div>

      {/* Analytics Chart area */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        className="bg-[#ffffff] dark:bg-[#000000] rounded-xl p-8 shadow-sm dark:shadow-none border border-[#e2e8f0] dark:border-[#27272a] transition-colors duration-500"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Study Analytic</h3>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors uppercase tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span> Focus Time</span>
              <span className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors uppercase tracking-wider"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span> Distractions</span>
            </div>
          </div>
          <select className="bg-slate-50 dark:bg-[#09090b] border box-border border-[#e2e8f0] dark:border-[#27272a] text-slate-600 dark:text-slate-300 text-sm rounded-lg px-5 py-2.5 outline-none font-bold cursor-pointer transition-colors focus:ring-2 focus:ring-brand-500">
            <option>This Year</option>
            <option>Last Year</option>
          </select>
        </div>

        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={isDarkMode ? 0.3 : 0.2}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={isDarkMode ? 0.3 : 0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#27272a" : "#e2e8f0"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#a1a1aa' : '#64748b', fontSize: 13, fontWeight: 600}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#a1a1aa' : '#64748b', fontSize: 13, fontWeight: 600}} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: isDarkMode ? '1px solid #27272a' : '1px solid #e2e8f0', 
                  backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                  fontWeight: 'bold'
                }}
                cursor={{ stroke: isDarkMode ? '#3f3f46' : '#cbd5e1', strokeWidth: 2, strokeDasharray: '6 6' }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#14b8a6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                activeDot={{ r: 6, strokeWidth: 2, fill: '#14b8a6', stroke: isDarkMode ? '#000000' : '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#6366f1" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorExpense)" 
                activeDot={{ r: 6, strokeWidth: 2, fill: '#6366f1', stroke: isDarkMode ? '#000000' : '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
