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
        className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)]"
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
    <div className="flex bg-[#ffffff] dark:bg-[#09090b] h-screen overflow-hidden transition-colors duration-500 relative">
      <BackgroundBlobs />
      
      {/* High Contrast Sidebar */}
      <motion.nav 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-64 bg-[#f8fafc] dark:bg-[#000000] border-r border-[#e2e8f0] dark:border-[#27272a] flex flex-col px-4 py-6 z-20 transition-colors duration-500"
      >
        <div className="flex items-center gap-3 mb-12 px-2 text-xl font-black text-slate-800 dark:text-white transition-colors duration-500 tracking-tight">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring" }}
            className="bg-brand-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.6)]"
          >
            <CheckCircle className="text-white w-5 h-5" />
          </motion.div>
          GrindTrack
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
            const Icon = item.icon;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold text-sm relative group
                  ${isActive 
                    ? 'text-white' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                {isActive && (
                   <motion.div layoutId="activeNavHighlight" className="absolute inset-0 bg-brand-500 rounded-lg z-0 shadow-lg shadow-brand-500/30 dark:shadow-neon-orange" />
                )}
                <Icon size={18} className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="relative z-10 font-[600]">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 dark:border-[#27272a] pt-4 transition-colors duration-500">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#18181b] hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-bold text-sm w-full"
          >
            {isDarkMode ? <Sun size={18} className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> : <Moon size={18} className="text-slate-400" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors font-bold text-sm w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.nav>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#ffffff] dark:from-[#09090b] to-transparent pointer-events-none z-10 transition-colors duration-500"></div>
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
