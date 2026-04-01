import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisibilityManager } from '../hooks/useVisibilityManager';
import { useSession } from '../context/SessionContext';
import { Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackerPage() {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("focus"); // 'focus', 'short', 'long'
  const { startSession, endSession } = useSession();
  const navigate = useNavigate();

  const {
    activeTime,
    distractions,
    isDistracted,
    setActiveTime,
    setDistractions
  } = useVisibilityManager(isActive);

  // Map modes to durations in seconds
  const modeDurations = {
    focus: 1500,
    short: 300,
    long: 900
  };

  const totalTime = modeDurations[mode];
  const timeLeft = Math.max(0, totalTime - activeTime);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!isActive) {
      await startSession();
      setIsActive(true);
    } else {
      setIsActive(false);
      // We don't automatically end the session on pause in the original backend logic,
      // but the user's UI expects a "Pause" behavior.
      // However, current endSession stops the DB record.
      // I'll stick to Start/Stop for now to preserve session integrity.
    }
  };

  const handleStop = async () => {
    setIsActive(false);
    await endSession(activeTime, distractions);
    setActiveTime(0);
    setDistractions(0);
  };

  const setModeTime = (type) => {
    if (isActive) {
      if (confirm("Switching modes will end your current session. Continue?")) {
        handleStop();
        setMode(type);
      }
    } else {
      setMode(type);
      setActiveTime(0);
    }
  };

  // Automatically end session if time runs out
  useEffect(() => {
    if (isActive && timeLeft === 0) {
      handleStop();
      // Play a sound or notification here if desired
    }
  }, [timeLeft, isActive]);

  return (
    <div className="h-full flex flex-col items-center justify-center py-12 transition-colors duration-500">
      
      {/* Aesthetic Container */}
      <div className="w-full max-w-[420px] p-8 rounded-[2.5rem] bg-white/5 dark:bg-black/20 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Switch (Simplified and Beautiful) */}
        <div className="flex bg-white/10 dark:bg-white/5 rounded-2xl p-1.5 mb-10 relative z-10 border border-white/5">
          {[
            { label: "Focus", key: "focus" },
            { label: "Short", key: "short" },
            { label: "Long", key: "long" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setModeTime(item.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === item.key
                  ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Timer Core */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <motion.div
            onClick={isActive ? handleStop : handleStart}
            className="w-64 h-64 rounded-full border-[6px] border-white/5 flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.2)] cursor-pointer group"
            animate={{ scale: isActive ? 1.02 : 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors duration-300" />

            {/* Animated Rotating Border */}
            {isActive && !isDistracted && (
              <div className="absolute inset-[-6px] rounded-full border-t-[6px] border-orange-500 animate-spin-slow shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
            )}

            <div className="flex flex-col items-center">
              <motion.h1 
                key={timeLeft}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-6xl font-black tracking-tighter transition-colors duration-300 ${isDistracted && isActive ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}
              >
                {formatTime(timeLeft)}
              </motion.h1>
              <div className={`mt-2 text-[10px] font-black uppercase tracking-[0.3em] ${isDistracted && isActive ? 'text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {isActive ? (isDistracted ? "Distracted" : "Focusing") : "Click to Start"}
              </div>
            </div>
          </motion.div>

          {/* Secondary Actions */}
          <div className="mt-8 flex justify-center">
            {isActive && (
              <button
                onClick={() => navigate('/focus', { state: { activeTime, distractions, isActive } })}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-800/50 dark:bg-white/10 text-white/70 dark:text-white/70 hover:text-white dark:hover:text-white border border-white/10 backdrop-blur-sm transition-all hover:bg-slate-800 dark:hover:bg-white/20"
                title="Maximize Focus Mode"
              >
                <Maximize size={16} strokeWidth={3} />
                <span className="text-xs font-bold uppercase tracking-widest">Maximize</span>
              </button>
            )}
          </div>
        </div>

        {/* Mini Stats (Beautiful Footer) */}
        <div className="flex justify-between mt-12 pt-8 border-t border-white/10 relative z-10">
          <div className="text-center">
            <p className="text-xl font-black text-slate-800 dark:text-white">4</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessions</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-black text-slate-800 dark:text-white">2h 10m</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focus Time</p>
          </div>
        </div>
      </div>
      
      {/* Distraction Hint */}
      <AnimatePresence>
        {isDistracted && isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-sm font-bold flex items-center gap-2"
          >
            <span className="animate-pulse">⚠️</span> Focus lost: Tab switched or minimized
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
