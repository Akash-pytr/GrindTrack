import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVisibilityManager } from '../hooks/useVisibilityManager';
import { useSession } from '../context/SessionContext';
import { Minimize, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ThreeTimerRing from '../components/three/ThreeTimerRing';

// Particle effect component for distractions
const DistractionParticle = ({ delay }) => {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      animate={{
        opacity: 0,
        scale: 0,
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400
      }}
      transition={{ duration: 0.8, delay }}
      className="absolute w-2 h-2 bg-red-500 rounded-full"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: '-4px',
        marginTop: '-4px',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)'
      }}
    />
  );
};

export default function FocusMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { endSession } = useSession();
  const { isDarkMode } = useTheme();

  const [isActive, setIsActive] = useState(true);
  const [particles, setParticles] = useState([]);

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

  // Trigger particles on distraction
  useEffect(() => {
    if (isDistracted) {
      setParticles(Array.from({ length: 12 }, (_, i) => i));
      setTimeout(() => setParticles([]), 800);
    }
  }, [isDistracted]);

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

  const totalTime = location.state?.totalTime || 1500;
  const timeLeft = Math.max(0, totalTime - activeTime);
  const backgroundImage = location.state?.backgroundImage || null;
  const progress = timeLeft / totalTime;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${
        isDistracted 
          ? isDarkMode ? 'bg-red-950/40' : 'bg-red-100/60'
          : isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'
      }`}
    >
      {/* 3D Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 ${
          isDistracted 
            ? 'bg-gradient-to-br from-red-500/10 via-transparent to-brand-500/10'
            : 'bg-gradient-to-br from-brand-500/5 via-transparent to-accent-500/10'
        }`} />
      </div>

      {/* Background Image */}
      <AnimatePresence>
        {backgroundImage && !isDistracted && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={backgroundImage} 
              alt="Background" 
              className="w-full h-full object-cover brightness-[0.3] blur-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated 3D Timer Ring */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 z-0"
      >
        <ThreeTimerRing 
          progress={progress} 
          isDistracted={isDistracted} 
          isActive={isActive}
        />
      </motion.div>

      {/* Distraction Particles */}
      <AnimatePresence>
        {particles.map((id) => (
          <DistractionParticle key={id} delay={id * 0.05} />
        ))}
      </AnimatePresence>

      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`relative z-10 backdrop-blur-2xl rounded-3xl px-12 py-16 min-w-[500px] border transition-all duration-500 ${
          isDistracted
            ? 'border-red-500/30 bg-red-500/10 shadow-2xl shadow-red-500/20'
            : 'border-white/20 bg-white/10 shadow-2xl shadow-brand-500/10'
        }`}
      >
        {/* Status Indicator */}
        <motion.div
          animate={{ scale: isDistracted ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.6, repeat: isDistracted ? Infinity : 0 }}
          className={`inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full backdrop-blur-xl border transition-all ${
            isDistracted
              ? 'border-red-500/50 bg-red-500/20 text-red-300'
              : 'border-brand-500/50 bg-brand-500/20 text-brand-300'
          }`}
        >
          {isDistracted ? (
            <>
              <AlertTriangle size={16} />
              <span className="text-sm font-semibold uppercase tracking-wider">Distracted</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span className="text-sm font-semibold uppercase tracking-wider">In Focus</span>
            </>
          )}
        </motion.div>

        {/* Title */}
        <motion.h2 
          animate={{ 
            color: isDistracted ? '#fca5a5' : '#c4b5fd',
            textShadow: isDistracted 
              ? '0 0 20px rgba(239, 68, 68, 0.5)'
              : '0 0 20px rgba(124, 58, 237, 0.4)'
          }}
          className="text-base font-bold uppercase tracking-[0.3em] mb-8 text-center transition-all"
        >
          {isDistracted ? 'Stay Focused' : 'Deep Work Mode'}
        </motion.h2>
        
        {/* Main Timer Display */}
        <motion.div 
          animate={!isDistracted ? {
            scale: [1, 1.01, 1],
          } : { 
            scale: [1, 0.99, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`text-center mb-12 p-8 rounded-2xl backdrop-blur-xl border transition-all ${
            isDistracted
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-brand-500/30 bg-brand-500/5'
          }`}
        >
          <div className="text-[7rem] md:text-[9rem] font-black tracking-tighter leading-none bg-gradient-to-br from-brand-300 to-accent-400 bg-clip-text text-transparent">
            {formatTime(timeLeft)}
          </div>
          <motion.p 
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs uppercase tracking-widest text-white/60 mt-4"
          >
            Time Remaining
          </motion.p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Active Time</p>
            <p className="text-2xl font-bold text-brand-300">{formatTime(activeTime)}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`text-center p-4 rounded-xl border backdrop-blur-xl transition-all ${
              distractions > 0
                ? 'border-red-500/30 bg-red-500/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Distractions</p>
            <p className={`text-2xl font-bold ${distractions > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {distractions}
            </p>
          </motion.div>
        </div>

        {/* End Session Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStop}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all border-2 border-red-500/50 bg-gradient-to-r from-red-500 to-red-600 text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/50 active:scale-95"
        >
          End Session
        </motion.button>
      </motion.div>

      {/* Minimize Button */}
      <motion.button 
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.85 }}
        onClick={handleMinimize}
        className="absolute top-8 right-8 z-50 p-3 rounded-full backdrop-blur-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all shadow-lg"
      >
        <Minimize size={24} />
      </motion.button>

      {/* Ambient Light Effects */}
      <AnimatePresence>
        {!isDistracted && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none -z-10"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -z-10"
            />
          </>
        )}
      </AnimatePresence>

      {/* Distraction Alert Glow */}
      <AnimatePresence>
        {isDistracted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/30 rounded-full blur-3xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
