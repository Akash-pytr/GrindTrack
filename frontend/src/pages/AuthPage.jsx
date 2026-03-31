import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen bg-[#fce5df] dark:bg-[#1a1525] flex p-4 items-center justify-center transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
        className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px] border border-transparent dark:border-slate-800 transition-colors duration-300"
      >
        
        {/* Left Form Side */}
        <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-brand-500 font-semibold text-sm tracking-wider uppercase mb-2">Welcome Back</h2>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white transition-colors">
              {isLogin ? 'Login' : 'Create Account'}
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5 transition-colors">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="John Doe"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5 transition-colors">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5 transition-colors">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold p-4 rounded-xl transition-colors shadow-lg shadow-brand-500/30 mt-8"
            >
              {isLogin ? 'Sign In' : 'Register Now'}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
            {isLogin ? "Don't have an account yet? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-600 dark:text-brand-500 hover:text-brand-500 dark:hover:text-brand-400 font-bold ml-1 transition-colors"
            >
              {isLogin ? 'Register for free' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Right Gradient Side */}
        <div className="hidden lg:flex w-1/2 gradient-mesh p-12 flex-col justify-between items-end relative overflow-hidden transition-all duration-700">
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[2px] transition-colors"></div>
          
          <div className="relative z-10 w-full flex justify-end">
            <div className="flex items-center gap-2 bg-white/20 dark:bg-black/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold shadow-sm transition-colors">
              <CheckCircle className="w-5 h-5 text-white" />
              <span>GrindTrack</span>
            </div>
          </div>

          <div className="relative z-10 text-right text-white">
            <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg leading-tight">Focus.<br/>Track.<br/>Achieve.</h2>
            <p className="text-white/80 dark:text-white/70 max-w-xs ml-auto font-medium transition-colors">Build a powerful habit of undisrupted learning and track your performance.</p>
          </div>
        </div>
        
      </motion.div>
    </div>
  );
}
