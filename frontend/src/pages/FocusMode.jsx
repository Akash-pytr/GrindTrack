import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVisibilityManager } from '../hooks/useVisibilityManager';
import { useSession } from '../context/SessionContext';
import { Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function FocusMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { endSession } = useSession();
  const { isDarkMode } = useTheme();

  const [isActive, setIsActive] = useState(true);

  const {
    activeTime,
    distractions,
    isDistracted,
    setActiveTime,
    setDistractions
  } = useVisibilityManager(isActive);

  useEffect(() => {
    if (location.state?.activeTime !== undefined) {
      setActiveTime(location.state.activeTime);
      setDistractions(location.state.distractions);
    }
  }, [location.state, setActiveTime, setDistractions]);

  const handleStop = async () => {
    setIsActive(false);
    await endSession(activeTime, distractions);
    navigate('/');
  };

  const handleMinimize = () => {
    navigate('/tracker', { state: { activeTime, distractions, isActive, totalTime } });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBackgroundColor = () => {
    if (isDistracted) return isDarkMode ? '#450a0a' : '#fee2e2';
    return isDarkMode ? '#121212' : '#ffffff';
  };

  const totalTime = location.state?.totalTime || 1500;
  const timeLeft = Math.max(0, totalTime - activeTime);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backgroundColor: getBackgroundColor() }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300"
    >
      
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleMinimize}
        className="absolute top-8 right-8 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-50 p-2 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <Minimize size={24} />
      </motion.button>

      <div className="text-center relative z-10 p-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] dark:shadow-none min-w-[500px] transition-colors duration-300">
        <motion.h2 
          animate={{ color: isDistracted ? '#ef4444' : '#f97316' }}
          className="text-lg font-bold uppercase tracking-[0.4em] mb-8"
        >
          {isDistracted ? 'Distraction Detected' : 'Deep Work'}
        </motion.h2>
        
        <motion.div 
          animate={!isDistracted ? {
            scale: [1, 1.02, 1],
          } : { scale: 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-[8rem] md:text-[10rem] font-bold text-slate-800 dark:text-white tracking-tighter mb-12 transition-colors duration-300"
        >
          {formatTime(timeLeft)}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:border-red-500 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 px-12 py-4 rounded-full font-bold uppercase tracking-wider transition-colors"
        >
          End Session
        </motion.button>
      </div>
      
      {/* Background ambient light */}
      <AnimatePresence>
        {!isDistracted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
