import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { BookOpen, BarChart3, Trophy, LogOut, CheckCircle, Clock, Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants, pageTransition } from './utils/animations';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TrackerPage from './pages/TrackerPage';
import FocusMode from './pages/FocusMode';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Layout component wraps the side nav and main content
const Layout = ({ children }) => {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BookOpen },
    { path: '/tracker', label: 'Tracker', icon: Clock },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="flex bg-[#f3f4f6] dark:bg-slate-950 h-screen overflow-hidden transition-colors duration-300">
      {/* Dynamic Sidebar */}
      <motion.nav 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col px-4 py-6 z-20 shadow-sm transition-colors duration-300"
      >
        <div className="flex items-center gap-3 mb-12 px-2 text-xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
          <div className="bg-brand-500 w-8 h-8 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-white w-5 h-5" />
          </div>
          GrindTrack
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${isActive 
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-500' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <Icon size={18} className={isActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'} />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 transition-colors duration-300">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium text-sm w-full"
          >
            {isDarkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-slate-400" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors font-medium text-sm w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.nav>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        {/* Subtle top header gradient */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-slate-100 dark:from-slate-900 to-transparent pointer-events-none z-0 transition-colors duration-300"></div>
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

// AnimatedRoutes wrapper handles AnimatePresence for transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/login" 
          element={
            <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="h-full">
              <AuthPage />
            </motion.div>
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Dashboard />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tracker" 
          element={
            <ProtectedRoute>
              <Layout>
                <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <TrackerPage />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/focus" 
          element={
            <ProtectedRoute>
              <motion.div initial="initial" animate="animate" exit="exit" variants={{initial: {opacity: 0}, animate: {opacity: 1}, exit: {opacity: 0}}} transition={{duration: 0.5}} className="h-full">
                <FocusMode />
              </motion.div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Layout>
                <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <AnalyticsPage />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition} className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <LeaderboardPage />
                </motion.div>
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
