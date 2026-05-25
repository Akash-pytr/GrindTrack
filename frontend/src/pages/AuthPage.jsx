import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeAuthScene from '../components/three/ThreeAuthScene';
import BrandingScene from '../components/three/BrandingScene';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Full-screen glitter background */}
      <div className="fixed inset-0 z-0">
        <ThreeAuthScene />
      </div>

      {/* Two-panel card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, type: 'spring', bounce: 0.2 }}
        className="relative z-10 flex w-full overflow-hidden"
        style={{
          maxWidth: '880px',
          minHeight: '520px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 0 80px rgba(0,0,0,0.8), 0 2px 0 rgba(255,255,255,0.05) inset',
        }}
      >

        {/* ── LEFT: Login form ── */}
        <div
          className="flex flex-col justify-center w-full md:w-[48%] px-10 py-12 shrink-0"
          style={{
            background: 'rgba(6, 6, 9, 0.96)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Subtitle + heading */}
          <div className="mb-8">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: '#f97316' }}
            >
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </p>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none">
              {isLogin ? 'Login' : 'Create Account'}
            </h1>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-5"
              >
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-3.5 rounded-xl text-sm">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all"
                    style={{
                      background: 'rgba(240,240,248,0.92)',
                      color: '#111',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                    onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #f97316')}
                    onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all"
                style={{
                  background: 'rgba(240,240,248,0.92)',
                  color: '#111',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #f97316')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3.5 text-sm font-medium outline-none transition-all"
                style={{
                  background: 'rgba(240,240,248,0.92)',
                  color: '#111',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #f97316')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full font-bold py-4 rounded-xl text-white text-base mt-2"
              style={{
                background: '#f97316',
                boxShadow: '0 0 28px rgba(249,115,22,0.4)',
              }}
            >
              {isLogin ? 'Sign In' : 'Register Now'}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {isLogin ? "Don't have an account yet? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-bold transition-colors"
              style={{ color: '#f97316' }}
              onMouseEnter={(e) => (e.target.style.color = '#fb923c')}
              onMouseLeave={(e) => (e.target.style.color = '#f97316')}
            >
              {isLogin ? 'Register for free' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* ── RIGHT: Branding panel ── */}
        <div
          className="hidden md:flex flex-col w-[52%] relative overflow-hidden"
          style={{ background: 'rgba(2, 2, 5, 0.6)' }}
        >
          {/* GrindTrack pill — top center */}
          <div className="flex justify-center pt-6">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(25,25,35,0.85)',
                border: '1px solid rgba(255,255,255,0.13)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#f97316' }}
              >
                <CheckCircle className="text-white w-3 h-3" />
              </div>
              <span className="text-white text-sm font-bold tracking-tight">GrindTrack</span>
            </div>
          </div>

          {/* 3D knot + text side by side */}
          <div className="flex-1 flex items-center justify-center px-6 gap-2">
            {/* 3D canvas */}
            <div className="w-[220px] h-[220px] shrink-0">
              <BrandingScene />
            </div>

            {/* Tagline text */}
            <div className="flex-1">
              <h2
                className="font-black leading-none tracking-tight"
                style={{ fontSize: '2.3rem', color: '#ffffff' }}
              >
                Focus.<br />Track.<br />Achieve.
              </h2>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Build a powerful<br />
                habit of<br />
                undisrupted<br />
                learning and track<br />
                your performance.
              </p>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
