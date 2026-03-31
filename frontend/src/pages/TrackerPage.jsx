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
    <div className="py-8 pt-20 h-full flex flex-col items-center justify-center max-w-5xl mx-auto transition-colors duration-500">
      
      {/* Top Navigation Ribbons specific to timer tracking */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="flex bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl p-1 shadow-sm mb-12 transition-colors duration-500"
      >
        <button className="px-6 py-2 rounded-lg bg-brand-500 text-white font-black text-sm flex items-center gap-2 shadow-sm">
          🎯 Focus
        </button>
        <button className="px-6 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#18181b] font-bold text-sm transition-all">
          ☕ Short Break
        </button>
        <button className="px-6 py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#18181b] font-bold text-sm transition-all">
          🌴 Long Break
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] dark:neon-border-orange rounded-[2rem] p-12 shadow-sm w-full max-w-2xl flex flex-col items-center justify-center relative transition-colors duration-500 scanline"
      >
        
        {/* Glow underneath the timer */}
        <AnimatePresence>
          {isActive && !isDistracted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.5, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="absolute w-80 h-80 bg-brand-500/60 rounded-full blur-[100px] pointer-events-none dark:shadow-neon-orange"
            />
          )}
        </AnimatePresence>

        {/* The massive circular timer container */}
        <div className="w-80 h-80 rounded-full bg-[#f8fafc] dark:bg-[#09090b] shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] border-[4px] border-[#e2e8f0] dark:border-[#27272a] flex flex-col items-center justify-center relative mb-10 transition-colors duration-500 z-10 box-border">
          
          {/* Subtle progress ring fake */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" className="stroke-[#f1f5f9] dark:stroke-[#18181b] transition-colors" strokeWidth="6" />
            <motion.circle 
              cx="50" cy="50" r="47" fill="none" stroke="#f97316" strokeWidth="6" 
              strokeDasharray="295"
              strokeDashoffset={isActive ? 295 * (1 - (activeTime % 1500) / 1500) : 295}
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_12px_rgba(249,115,22,0.9)]"
              transition={{ ease: "linear" }}
            />
          </svg>

          <motion.div 
            key={activeTime}
            initial={{ opacity: 0.8, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-7xl font-black font-sans tracking-tighter transition-colors duration-300 ${isDistracted && isActive ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}
          >
            {formatTime(activeTime)}
          </motion.div>
          <div className="mt-2 font-black tracking-[0.2em] text-xs uppercase text-slate-400 dark:text-slate-500">
            {isActive ? (isDistracted ? 'Distracted' : 'In Progress') : 'Ready to Focus'}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4 relative z-10 w-full justify-center">
          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.button
                key="play"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="w-full max-w-[200px] h-14 rounded-xl bg-brand-500 text-white font-black text-lg flex items-center justify-center gap-3 shadow-[0_5px_15px_-5px_rgba(249,115,22,0.5)] transition-all hover:shadow-[0_8px_20px_-5px_rgba(249,115,22,0.6)]"
              >
                <Play fill="currentColor" size={20} />
                START
              </motion.button>
            ) : (
              <motion.div key="controls" className="flex gap-4 w-full justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStop}
                  className="w-48 h-14 rounded-xl bg-[#ffffff] dark:bg-[#000000] border box-border border-[#e2e8f0] dark:border-[#27272a] text-slate-800 dark:text-white font-black text-lg flex items-center justify-center gap-3 hover:border-red-500 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-500 transition-all shadow-sm"
                >
                  <Square fill="currentColor" size={20} />
                  STOP
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/focus', { state: { activeTime, distractions, isActive } })}
                  className="w-48 h-14 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-slate-900 dark:hover:bg-white transition-all dark:shadow-neon-orange"
                >
                  <Maximize strokeWidth={3} size={20} />
                  MAXIMIZE
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
