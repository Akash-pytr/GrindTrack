import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisibilityManager } from '../hooks/useVisibilityManager';
import { useSession } from '../context/SessionContext';
import { Play, Square, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackerPage() {
  const [isActive, setIsActive] = useState(false);
  const { startSession, endSession } = useSession();
  const navigate = useNavigate();

  const {
    activeTime,
    distractions,
    isDistracted,
    setActiveTime,
    setDistractions
  } = useVisibilityManager(isActive);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    await startSession();
    setActiveTime(0);
    setDistractions(0);
    setIsActive(true);
  };

  const handleStop = async () => {
    setIsActive(false);
    await endSession(activeTime, distractions);
  };

  return (
    <div className="py-8 h-full flex flex-col items-center max-w-5xl mx-auto transition-colors duration-300">
      
      {/* Top Navigation Ribbons specific to timer */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full p-1 shadow-sm mb-12 transition-colors duration-300">
        <button className="px-6 py-2 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-500 font-bold text-sm flex items-center gap-2 transition-colors">
          🎯 Focus
        </button>
        <button className="px-6 py-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors">
          ☕ Short Break
        </button>
        <button className="px-6 py-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors">
          🌴 Long Break
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm w-full max-w-2xl aspect-square flex flex-col items-center justify-center relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-300"
      >
        {/* The massive circular timer container */}
        <div className="w-80 h-80 rounded-full bg-slate-50/50 dark:bg-slate-950/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-[8px] border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative mb-8 transition-colors duration-300">
          
          {/* Subtle progress ring fake */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" className="stroke-[#fce5df] dark:stroke-slate-800 transition-colors" strokeWidth="4" />
            <motion.circle 
              cx="50" cy="50" r="48" fill="none" stroke="#f97316" strokeWidth="4" 
              strokeDasharray="301.59"
              strokeDashoffset={isActive ? 301.59 * (1 - (activeTime % 1500) / 1500) : 301.59}
              strokeLinecap="round"
              transition={{ ease: "linear" }}
            />
          </svg>

          <motion.div 
            key={activeTime}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="text-7xl font-bold text-slate-800 dark:text-white font-sans tracking-tight transition-colors duration-300"
          >
            {formatTime(activeTime)}
          </motion.div>
          <div className={`mt-2 font-medium tracking-widest text-sm uppercase transition-colors duration-300 ${isDistracted && isActive ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
            {isActive ? (isDistracted ? 'Distracted' : 'In Progress') : 'Ready'}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4">
          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.button
                key="play"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 transition-shadow hover:shadow-brand-500/40"
              >
                <Play fill="currentColor" size={28} className="translate-x-1" />
              </motion.button>
            ) : (
              <motion.div key="controls" className="flex gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 dark:hover:border-red-500/50 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center shadow-sm transition-colors"
                >
                  <Square fill="currentColor" size={24} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/focus', { state: { activeTime, distractions, isActive } })}
                  className="w-16 h-16 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors"
                >
                  <Maximize size={24} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>

      {/* Shortcuts Display */}
      <div className="mt-8 flex gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 transition-colors duration-300">
        <div className="flex items-center gap-1"><span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">Space</span> Start/Pause</div>
        <div className="flex items-center gap-1"><span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">S</span> Skip</div>
      </div>
      
    </div>
  );
}
