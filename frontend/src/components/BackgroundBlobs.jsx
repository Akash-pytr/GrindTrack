import { useTheme } from '../context/ThemeContext';
import ThreeBackground from './three/ThreeBackground';

export default function BackgroundBlobs() {
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* Three.js animated background */}
      <ThreeBackground />

      {/* Subtle grid overlay on top of Three.js canvas */}
      <div
        className={`fixed inset-0 overflow-hidden pointer-events-none z-[1] transition-colors duration-500 ${
          isDarkMode ? 'bg-grid-slate-800' : 'bg-grid-slate-100'
        }`}
        aria-hidden="true"
      />
    </>
  );
}
