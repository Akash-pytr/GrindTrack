import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function AnalyticsChart({ data, loading, onPeriodChange, className }) {
  const { isDarkMode } = useTheme();
  const [period, setPeriod] = useState('day');
  const [chartData, setChartData] = useState(data || []);

  useEffect(() => {
    if (data && data.length > 0) {
      // Convert seconds to minutes for display
      const convertedData = data.map(item => ({
        ...item,
        totalTime: Math.round(item.totalTime / 60), // Convert seconds to minutes
        displayTotalTime: item.totalTime // Keep original for calculations
      }));
      setChartData(convertedData);
    }
  }, [data]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
      className={`rounded-2xl p-8 shadow-lg dark:shadow-none border ${
        isDarkMode ? 'bg-black border-zinc-800' : 'bg-white border-slate-200'
      } transition-colors duration-500 ${className}`}
    >
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h3 className={`text-xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Study Analytics
          </h3>
          <div className="flex gap-4 mt-3">
            <span className={`flex items-center text-xs font-bold uppercase tracking-wider transition-colors ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span className="w-3 h-3 rounded-full bg-teal-500 mr-2 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span>
              Focus Time
            </span>
            <span className={`flex items-center text-xs font-bold uppercase tracking-wider transition-colors ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
              Distractions
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {['day', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                period === p
                  ? isDarkMode
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-500 text-white shadow-lg'
                  : isDarkMode
                  ? 'bg-zinc-800 text-slate-300 hover:bg-zinc-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className={`w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full ${
              isDarkMode ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''
            }`}
          />
        </div>
      ) : chartData && chartData.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFocusTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={isDarkMode ? 0.3 : 0.2} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDistractions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={isDarkMode ? 0.3 : 0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDarkMode ? '#27272a' : '#e2e8f0'}
              />
              <XAxis
                dataKey="_id"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#a1a1aa' : '#64748b', fontSize: 11, fontWeight: 600 }}
                dy={10}
                interval={Math.max(0, Math.floor(chartData.length / 8))}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#a1a1aa' : '#64748b', fontSize: 12, fontWeight: 600 }}
                domain={['dataMin - 10', 'dataMax + 10']}
                type="number"
                tickFormatter={(value) => `${value} min`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: isDarkMode ? '1px solid #27272a' : '1px solid #e2e8f0',
                  backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                  fontWeight: 'bold'
                }}
                cursor={{
                  stroke: isDarkMode ? '#3f3f46' : '#cbd5e1',
                  strokeWidth: 2,
                  strokeDasharray: '6 6'
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const totalTime = payload.find(p => p.dataKey === 'totalTime')?.value || 0;
                    const totalDistractions = payload.find(p => p.dataKey === 'totalDistractions')?.value || 0;
                    return (
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-black border border-zinc-700' : 'bg-white border border-slate-300'}`}>
                        <p className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {label}
                        </p>
                        <p className="text-sm font-bold text-emerald-500">
                          Focus: {totalTime} min
                        </p>
                        <p className="text-sm font-bold text-indigo-500">
                          Distraction: {totalDistractions}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          Total: {totalTime} min
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="natural"
                dataKey="totalDistractions"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={0.8}
                fill="url(#colorDistractions)"
                activeDot={{ r: 5, strokeWidth: 2, fill: '#6366f1', stroke: isDarkMode ? '#000000' : '#fff' }}
                name="Distractions"
                isAnimationActive={true}
              />
              <Area
                type="natural"
                dataKey="totalTime"
                stroke="#14b8a6"
                strokeWidth={2.5}
                fillOpacity={0.6}
                fill="url(#colorFocusTime)"
                activeDot={{ r: 5, strokeWidth: 2, fill: '#14b8a6', stroke: isDarkMode ? '#000000' : '#fff' }}
                name="Focus Time"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-80">
          <div className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <p className="text-lg font-semibold">No data available yet</p>
            <p className="text-sm mt-2">Start a study session to see your analytics</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
