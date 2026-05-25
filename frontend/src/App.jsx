import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { BookOpen, BarChart3, Trophy, LogOut, CheckCircle, Clock, Sun, Moon, Library } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants, pageTransition } from './utils/animations';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TrackerPage from './pages/TrackerPage';
import FocusMode from './pages/FocusMode';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LibrariesPage from './pages/LibrariesPage';
import RoomView from './pages/RoomView';
import BackgroundBlobs from './components/BackgroundBlobs';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#09090b]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full shadow-[0_0_20px_rgba(124,58,237,0.5)]"
      />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Reusable page wrapper to eliminate repeated motion boilerplate
const PageWrapper = ({ children, className = 'h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
    className={className}
  >
    {children}
  </motion.div>
);

// High Contrast Layout
const Layout = ({ children }) => {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = useMemo(() => [
    { path: '/', label: 'Overview', icon: BookOpen },
    { path: '/tracker', label: 'Pomodoro', icon: Clock },
    { path: '/libraries', label: 'Study Rooms', icon: Library },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/leaderboard', label: 'Hall of Fame', icon: Trophy },
  ], []);

  return (
    <div className="flex flex-col bg-[#ffffff] dark:bg-[#09090b] h-screen overflow-hidden transition-colors duration-500 relative">
      <BackgroundBlobs />
      
      {/* High Contrast Top Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full bg-[#f8fafc]/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-[#e2e8f0] dark:border-[#27272a] flex items-center justify-between px-6 py-4 z-20 transition-colors duration-500"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 text-xl font-black text-slate-800 dark:text-white transition-colors duration-500 tracking-tight">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring" }}
            className="bg-gradient-to-br from-brand-400 to-brand-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_18px_rgba(124,58,237,0.65)]"
          >
            <CheckCircle className="text-white w-5 h-5" />
          </motion.div>
          <span className="bg-gradient-to-r from-brand-500 via-brand-400 to-accent-500 bg-clip-text text-transparent">GrindTrack</span>
        </div>

        {/* Horizontal Navigation Items */}
        <div className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
            const Icon = item.icon;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm relative group
                  ${isActive 
                    ? 'text-white' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#18181b]'}`}
              >
                {isActive && (
                   <motion.div layoutId="activeNavHighlight" className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-400 rounded-xl z-0 shadow-lg shadow-brand-500/40 dark:shadow-neon-brand" />
                )}
                <Icon size={16} className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="relative z-10 font-[600] hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#18181b] hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-bold text-sm"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={18} className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> : <Moon size={18} className="text-slate-400" />}
          </button>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all font-bold text-sm"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </motion.nav>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#ffffff] dark:from-[#09090b] to-transparent pointer-events-none z-10 transition-colors duration-500"></div>
        <div className="relative z-20 w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PageWrapper className="h-full">
              <AuthPage />
            </PageWrapper>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <PageWrapper><Dashboard /></PageWrapper>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <Layout>
                <PageWrapper><TrackerPage /></PageWrapper>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/libraries"
          element={
            <ProtectedRoute>
              <Layout>
                <PageWrapper><LibrariesPage /></PageWrapper>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/libraries/:roomId"
          element={
            <ProtectedRoute>
              <Layout>
                <PageWrapper><RoomView /></PageWrapper>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/focus"
          element={
            <ProtectedRoute>
              <PageWrapper
                className="h-full"
              >
                <FocusMode />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <PageWrapper><AnalyticsPage /></PageWrapper>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Layout>
                <PageWrapper><LeaderboardPage /></PageWrapper>
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
