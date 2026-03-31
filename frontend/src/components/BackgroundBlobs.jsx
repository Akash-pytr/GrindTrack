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
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] bg-brand-500/5"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] bg-blue-500/5"
          />
        </>
      )}

      {/* Dark Mode Ambient Particles - High Contrast Neon */}
      {isDarkMode && (
        <>
          <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-[2px] z-[1]"></div>
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] bg-brand-500/10 mix-blend-screen z-0"
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.5, 1] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] left-[-20%] w-[900px] h-[900px] rounded-full blur-[160px] bg-indigo-500/10 mix-blend-screen z-0"
          />
        </>
      )}
    </div>
  );
}
