import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVisibilityManager } from '../hooks/useVisibilityManager';
import { useSession } from '../context/SessionContext';
import { Maximize, Palette, X, ChevronRight, Check, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

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

  // Map modes to durations in seconds
  const modeDurations = {
    focus: customFocusTime,
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

  const handleSaveCustomTime = () => {
    const totalSeconds = (parseInt(editHours) * 3600) + (parseInt(editMinutes) * 60);
    if (totalSeconds > 0) {
      setCustomFocusTime(totalSeconds);
      localStorage.setItem('customFocusTime', totalSeconds.toString());
      setIsEditing(false);
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
                  <Palette className="text-orange-500" size={24} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Themes</h3>
                </div>
                {Object.keys(THEMES).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedCategory === cat 
                        ? "bg-orange-500 text-black shadow-lg" 
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
                          <div className="bg-orange-500 p-1 rounded-full text-black">
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
      
      {/* Aesthetic Container (Made transparent for themes) */}
      <div className="w-full max-w-[420px] p-8 rounded-[2.5rem] relative overflow-hidden">
        
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
            onClick={isActive ? handleStop : (isEditing ? null : handleStart)}
            className="w-64 h-64 rounded-full border-[6px] border-white/5 flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.2)] cursor-pointer group"
            animate={{ scale: isActive ? 1.02 : 1 }}
            whileHover={{ scale: isEditing ? 1 : 1.05 }}
            whileTap={{ scale: isEditing ? 1 : 0.95 }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          >
            {/* Hover Glow Effect */}
            {!isEditing && <div className="absolute inset-0 rounded-full bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors duration-300" />}

            {/* Animated Rotating Border */}
            {isActive && !isDistracted && (
              <div className="absolute inset-[-6px] rounded-full border-t-[6px] border-orange-500 animate-spin-slow shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
            )}

            <div className="flex flex-col items-center">
              {isEditing ? (
                <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <input 
                        type="number" 
                        value={editHours} 
                        onChange={(e) => setEditHours(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg text-3xl font-black text-center text-white focus:outline-none focus:border-orange-500"
                        min="0"
                      />
                      <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Hrs</span>
                    </div>
                    <span className="text-3xl font-black text-white">:</span>
                    <div className="flex flex-col items-center">
                      <input 
                        type="number" 
                        value={editMinutes} 
                        onChange={(e) => setEditMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg text-3xl font-black text-center text-white focus:outline-none focus:border-orange-500"
                        min="0"
                        max="59"
                      />
                      <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Min</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={handleSaveCustomTime}
                      className="px-4 py-1.5 bg-orange-500 text-black text-xs font-black rounded-lg hover:bg-orange-400 transition-colors"
                    >
                      SAVE
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 bg-white/10 text-white text-xs font-black rounded-lg hover:bg-white/20 transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                    whileHover={!isActive && mode === "focus" ? { scale: 1.05, color: "#f97316" } : {}}
                    className={`text-6xl font-black tracking-tighter transition-colors duration-300 cursor-pointer ${isDistracted && isActive ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}
                    title={!isActive && mode === "focus" ? "Click digits to edit time" : ""}
                  >
                    {formatTime(timeLeft)}
                  </motion.h1>
                  <div className={`mt-2 text-[10px] font-black uppercase tracking-[0.3em] ${isDistracted && isActive ? 'text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {isActive ? (isDistracted ? "Distracted" : "Focusing") : "Click to Start"}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Secondary Actions */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {!isActive && mode === "focus" && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 transition-all font-black text-[10px] uppercase tracking-widest"
                title="Customize Focus Time"
              >
                <Settings2 size={14} />
                Edit Focus Time
              </button>
            )}
            
            {isActive && (
              <button
                onClick={() => navigate('/focus', { state: { activeTime, distractions, isActive, totalTime, backgroundImage } })}
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
