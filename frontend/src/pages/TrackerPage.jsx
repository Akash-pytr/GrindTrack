import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVisibilityManager } from '../hooks/useVisibilityManager';
import { useSession } from '../context/SessionContext';
import { Maximize, Palette, X, ChevronRight, Check, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ThreeTimerRing from '../components/three/ThreeTimerRing';

const THEMES = {
  "Aesthetic": [
    { name: "Minimal Dark", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070" },
    { name: "Neon Night", url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=2070" },
    { name: "Mountain Mist", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070" },
    { name: "Ocean Sunset", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070" }
  ],
  "Cartoon": [
    { name: "Shinchan Family", url: "/themes/shinchan_family.png" },
    { name: "Shinchan Cool", url: "https://images.pxfuel.com/wallpaper/264/356/v4s/crayon-shin-chan-wallpaper-preview.jpg" },
    { name: "Doraemon", url: "https://images.pxfuel.com/wallpaper/921/1018/v4s/doraemon-wallpaper-preview.jpg" }
  ],
  "Anime": [
    { name: "Naruto & Sasuke", url: "/themes/naruto_art.png" },
    { name: "One Piece", url: "https://images.pxfuel.com/wallpaper/131/131/v4s/one-piece-wallpaper-preview.jpg" },
    { name: "Demon Slayer", url: "https://images.pxfuel.com/wallpaper/131/132/v4s/demon-slayer-wallpaper-preview.jpg" }
  ],
  "Superhero": [
    { name: "Avengers Assemble", url: "https://images.pxfuel.com/wallpaper/775/131/v4s/avengers-wallpaper-preview.jpg" },
    { name: "Iron Man", url: "https://images.pxfuel.com/wallpaper/131/131/v4s/iron-man-wallpaper-preview.jpg" },
    { name: "Spiderman", url: "https://images.pxfuel.com/wallpaper/132/132/v4s/spiderman-wallpaper-preview.jpg" }
  ],
  "DC": [
    { name: "Batman Dark", url: "/themes/batman_dark.png" },
    { name: "The Joker", url: "https://images.pxfuel.com/wallpaper/132/132/v4s/joker-wallpaper-preview.jpg" },
    { name: "Superman", url: "https://images.pxfuel.com/wallpaper/132/132/v4s/superman-wallpaper-preview.jpg" }
  ],
  "Cars": [
    { name: "Porsche 911", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070" },
    { name: "Lambo Neon", url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2070" },
    { name: "Classic Mustang", url: "https://images.unsplash.com/photo-1584345604482-8ce327fd517c?q=80&w=2070" }
  ],
  "Bikes": [
    { name: "Superbike Speed", url: "https://images.unsplash.com/photo-1558981403-c5f91ebefc25?q=80&w=2070" },
    { name: "Yamaha R1", url: "https://images.unsplash.com/photo-1449495169669-7b118f960237?q=80&w=2070" },
    { name: "Triumph Thruxton", url: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=2070" }
  ]
};

export default function TrackerPage() {
  const location = useLocation();
  const [isActive, setIsActive] = useState(() => location.state?.isActive || false);
  const [mode, setMode] = useState("focus"); // 'focus', 'short', 'long'
  const { startSession, endSession } = useSession();
  const navigate = useNavigate();
  const { isDarkMode, backgroundImage, setBackgroundImage } = useTheme();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Aesthetic");

  // Custom duration state (stored in seconds)
  const [customFocusTime, setCustomFocusTime] = useState(() => {
    const saved = localStorage.getItem('customFocusTime');
    return saved ? parseInt(saved, 10) : 1500; // Default 25 min
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState(Math.floor(customFocusTime / 3600));
  const [editMinutes, setEditMinutes] = useState(Math.floor((customFocusTime % 3600) / 60));

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
    }
    if (location.state?.distractions !== undefined) {
      setDistractions(location.state.distractions);
    }
  }, [location.state, setActiveTime, setDistractions]);

  const modeDurations = useMemo(() => ({
    focus: customFocusTime,
    short: 300,
    long: 900
  }), [customFocusTime]);

  const totalTime = modeDurations[mode];
  const timeLeft = useMemo(() => Math.max(0, totalTime - activeTime), [totalTime, activeTime]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = useCallback(async () => {
    if (!isActive) {
      await startSession();
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [isActive, startSession]);

  const handleStop = useCallback(async () => {
    setIsActive(false);
    await endSession(activeTime, distractions);
    setActiveTime(0);
    setDistractions(0);
  }, [activeTime, distractions, endSession, setActiveTime, setDistractions]);

  const setModeTime = useCallback((type) => {
    if (isActive) {
      if (confirm('Switching modes will end your current session. Continue?')) {
        handleStop();
        setMode(type);
      }
    } else {
      setMode(type);
      setActiveTime(0);
    }
  }, [isActive, handleStop, setActiveTime]);

  const handleSaveCustomTime = useCallback(() => {
    const hrs = Math.max(0, parseInt(editHours) || 0);
    const mins = Math.max(0, Math.min(59, parseInt(editMinutes) || 0));
    const totalSeconds = hrs * 3600 + mins * 60;
    if (totalSeconds > 0) {
      setCustomFocusTime(totalSeconds);
      localStorage.setItem('customFocusTime', totalSeconds.toString());
      setIsEditing(false);
      setActiveTime(0);
    }
  }, [editHours, editMinutes, setActiveTime]);

  // Automatically end session if time runs out
  useEffect(() => {
    if (isActive && timeLeft === 0) {
      handleStop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isActive]);

  return (
    <div className="h-full min-h-screen flex flex-col items-center justify-center py-12 transition-all duration-700 relative overflow-hidden">
      
      {/* Dynamic Background Image */}
      <AnimatePresence>
        {backgroundImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={backgroundImage} 
              alt="Background" 
              className="w-full h-full object-cover brightness-[0.4] scale-105"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Button (Top Right) */}
      <div className="absolute top-8 right-8 z-50">
        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white shadow-xl transition-all hover:scale-110 active:scale-95"
          title="Change Theme"
        >
          <Palette size={24} />
        </button>
      </div>

      {/* Theme Modal */}
      <AnimatePresence>
        {isThemeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setIsThemeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-slate-900/90 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]"
            >
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-black/30 p-8 border-r border-white/5 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-8">
                  <Palette className="text-brand-400" size={24} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Themes</h3>
                </div>
                {Object.keys(THEMES).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedCategory === cat 
                        ? "bg-gradient-to-r from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/40" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat}
                    <ChevronRight size={16} className={selectedCategory === cat ? "opacity-100" : "opacity-0"} />
                  </button>
                ))}
                
                <div className="mt-auto pt-8 border-t border-white/5">
                  <button
                    onClick={() => setBackgroundImage(null)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all text-left"
                  >
                    Reset Background
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedCategory}</h4>
                  <button onClick={() => setIsThemeModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-all">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {THEMES[selectedCategory].map((theme) => (
                    <motion.div
                      key={theme.url}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setBackgroundImage(theme.url)}
                      className="group cursor-pointer rounded-2xl overflow-hidden relative aspect-video border border-white/5 bg-white/5"
                    >
                      <img 
                        src={theme.url} 
                        alt={theme.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute bottom-4 left-4 flex items-center justify-between right-4">
                        <span className="text-sm font-bold text-white tracking-tight">{theme.name}</span>
                        {backgroundImage === theme.url && (
                          <div className="bg-gradient-to-br from-brand-500 to-accent-500 p-1 rounded-full text-white">
                            <Check size={14} strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Aesthetic Container with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[500px] px-10 py-14 rounded-[3.5rem] relative overflow-hidden backdrop-blur-3xl border border-white/30 bg-gradient-to-br from-white/15 via-white/8 to-white/5 shadow-2xl shadow-black/20"
      >
        
        {/* Decorative animated elements */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-500/30 to-accent-500/10 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 25, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity, delay: 0.5 } }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-[3.5rem] pointer-events-none" />

        {/* Enhanced Mode Switch */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 bg-gradient-to-r from-white/15 to-white/10 dark:from-white/10 dark:to-white/5 rounded-2xl p-2.5 mb-12 relative z-10 border border-white/20 backdrop-blur-xl shadow-lg shadow-brand-500/10"
        >
          {[
            { label: "Focus", key: "focus", icon: "⚡" },
            { label: "Short", key: "short", icon: "⏱️" },
            { label: "Long", key: "long", icon: "🎯" },
          ].map((item) => (
            <motion.button
              key={item.key}
              onClick={() => setModeTime(item.key)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                mode === item.key
                  ? "bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/50 scale-105 font-black text-base"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-transparent hover:border-white/10"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Timer Core */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <motion.div
            onClick={isActive ? handleStop : (isEditing ? null : handleStart)}
            className="w-72 h-72 rounded-full flex items-center justify-center relative cursor-pointer group"
            animate={{ scale: isActive ? 1.02 : 1 }}
            whileHover={{ scale: isEditing ? 1 : 1.04 }}
            whileTap={{ scale: isEditing ? 1 : 0.96 }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          >
            {/* Three.js 3D Torus Ring */}
            <ThreeTimerRing
              progress={totalTime > 0 ? timeLeft / totalTime : 1}
              isDistracted={isDistracted}
              isActive={isActive}
            />

            {/* Enhanced Hover Glow Effect */}
            <motion.div 
              animate={{ opacity: isActive ? 0.4 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500/20 to-transparent pointer-events-none" 
            />
            {!isEditing && (
              <motion.div 
                className="absolute inset-0 rounded-full bg-brand-500/0 group-hover:bg-brand-500/10 transition-colors duration-300 z-10" 
              />
            )}

            <div className="flex flex-col items-center">
              {isEditing ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <input 
                        type="number" 
                        value={editHours} 
                        onChange={(e) => setEditHours(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-18 bg-white/10 border border-white/20 rounded-lg text-3xl font-black text-center text-white focus:outline-none focus:border-brand-500 focus:bg-brand-500/10 transition-all"
                        min="0"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-2">Hours</span>
                    </div>
                    <span className="text-3xl font-black text-white/40">:</span>
                    <div className="flex flex-col items-center">
                      <input 
                        type="number" 
                        value={editMinutes} 
                        onChange={(e) => setEditMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-18 bg-white/10 border border-white/20 rounded-lg text-3xl font-black text-center text-white focus:outline-none focus:border-brand-500 focus:bg-brand-500/10 transition-all"
                        min="0"
                        max="59"
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-2">Minutes</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 w-full">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveCustomTime}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-400 text-white text-xs font-black rounded-lg hover:shadow-lg hover:shadow-brand-500/40 transition-all"
                    >
                      SAVE
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-lg border border-white/10 transition-all"
                    >
                      CANCEL
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <motion.h1 
                    key={timeLeft}
                    initial={{ opacity: 0.8, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={(e) => {
                      if (!isActive && mode === "focus") {
                        e.stopPropagation();
                        setIsEditing(true);
                      }
                    }}
                    whileHover={!isActive && mode === "focus" ? { scale: 1.08, color: "#f97316" } : {}}
                    className={`text-7xl md:text-8xl font-black tracking-tighter transition-all duration-300 cursor-pointer ${
                      isDistracted && isActive 
                        ? 'text-red-500 drop-shadow-lg drop-shadow-red-500/50' 
                        : 'text-slate-800 dark:text-white drop-shadow-md'
                    }`}
                    title={!isActive && mode === "focus" ? "Click to edit time" : ""}
                  >
                    {formatTime(timeLeft)}
                  </motion.h1>
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`mt-3 text-xs font-black uppercase tracking-[0.2em] transition-colors ${
                      isDistracted && isActive 
                        ? 'text-red-400' 
                        : isActive ? 'text-brand-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isActive ? (isDistracted ? "⚠️ Distracted" : "✨ Focusing") : "👆 Click to Start"}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Secondary Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col items-center gap-4 w-full px-8"
          >
            {!isActive && mode === "focus" && !isEditing && (
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500/20 to-accent-500/10 text-brand-400 border border-brand-500/30 hover:border-brand-500/50 hover:bg-brand-500/30 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-500/20"
                title="Customize Focus Time"
              >
                <Settings2 size={16} />
                Edit Focus Time
              </motion.button>
            )}
            
            {isActive && (
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/focus', { state: { activeTime, distractions, isActive, totalTime, backgroundImage } })}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-slate-800/80 to-slate-900/80 dark:from-white/20 dark:to-white/10 text-white border border-white/20 hover:border-brand-400/40 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-brand-500/20 font-bold text-xs uppercase tracking-widest"
                title="Maximize Focus Mode"
              >
                <Maximize size={18} strokeWidth={2.5} />
                Maximize View
              </motion.button>
            )}

            {isActive && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs uppercase tracking-widest border border-red-600/50 hover:shadow-lg hover:shadow-red-500/40 transition-all"
                title="End Session Now"
              >
                End Session
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Enhanced Mini Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-12 mt-14 pt-8 border-t border-white/10 relative z-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center group cursor-pointer"
          >
            <motion.p 
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-black bg-gradient-to-br from-brand-300 to-brand-500 bg-clip-text text-transparent"
            >
              {Math.floor(activeTime / 60)}
            </motion.p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active Minutes</p>
          </motion.div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`text-center group cursor-pointer ${distractions > 0 ? 'opacity-100' : 'opacity-60'}`}
          >
            <motion.p 
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className={`text-3xl font-black ${distractions > 0 ? 'text-red-400' : 'text-green-400'}`}
            >
              {distractions}
            </motion.p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Distractions</p>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Enhanced Distraction Alert */}
      <AnimatePresence>
        {isDistracted && isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mt-10 px-8 py-4 backdrop-blur-xl bg-gradient-to-r from-red-500/20 to-brand-500/10 border-2 border-red-500/40 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3 shadow-lg shadow-red-500/20"
          >
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-xl">
              ⚠️
            </motion.span>
            <div className="flex-1">
              <p className="font-black text-red-300">Focus Lost!</p>
              <p className="text-xs text-red-400/80 mt-1">Tab switched or minimized - stay focused! 💪</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
