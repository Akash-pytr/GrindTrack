import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function BackgroundBlobs() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${isDarkMode ? 'bg-grid-slate-800' : 'bg-grid-slate-100'} transition-colors duration-500`}>
      
      {/* Light Mode Blobs - Very Subtle */}
      {!isDarkMode && (
        <>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], x: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: 'transform' }}
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] bg-brand-500/5"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ willChange: 'transform' }}
            className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] bg-blue-500/5"
          />
        </>
      )}

      {/* Dark Mode Ambient Particles - High Contrast Neon */}
      {isDarkMode && (
        <>
          <div className="absolute inset-0 bg-[#000000]/40 backdrop-blur-[1px] z-[1]"></div>
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.3, 1], x: [0, 50, 0] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            style={{ willChange: 'transform' }}
            className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full blur-[120px] bg-brand-500/20 mix-blend-screen z-0"
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.4, 1], x: [0, -50, 0] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            style={{ willChange: 'transform' }}
            className="absolute bottom-[-15%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[140px] bg-blue-600/20 mix-blend-screen z-0"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], y: [0, 100, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: 'transform' }}
            className="absolute top-[20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[160px] bg-purple-600/10 mix-blend-screen z-0"
          />
        </>
      )}
    </div>
  );
}
