import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Users, Search, Lock, Globe, Code, GraduationCap } from 'lucide-react';
import { staggerContainer, cardItem } from '../utils/animations';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const predefinedRooms = [
  { id: 'public-library', name: 'Public Library', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'college-library', name: 'College Library', icon: Library, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'coder-vc', name: 'Coder VC', icon: Code, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: '10th-vc', name: 'Class 10th', icon: GraduationCap, color: 'text-brand-500', bg: 'bg-brand-500/10' },
  { id: '12th-vc', name: 'Class 12th', icon: GraduationCap, color: 'text-brand-500', bg: 'bg-brand-500/10' },
  { id: 'random', name: 'Random', icon: Users, color: 'text-slate-500', bg: 'bg-slate-500/10' },
];

export default function LibrariesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCounts, setActiveCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');

  useEffect(() => {
    // Connect just to get lobby stats
    // Assuming backend runs on 5050 in dev
    const socket = io();

    socket.on('connect', () => {
      socket.emit('get-lobby-state');
    });

    socket.on('lobby-state', (counts) => {
      setActiveCounts(counts);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = useCallback((roomId, roomName) => {
    navigate(`/libraries/${roomId}`, { state: { roomName } });
  }, [navigate]);

  const handleCreateCustom = useCallback((e) => {
    e.preventDefault();
    if (!customRoomName.trim()) return;
    const roomId = `custom-${customRoomName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    handleJoin(roomId, customRoomName);
    setCustomRoomName('');
    setShowCustomModal(false);
  }, [customRoomName, handleJoin]);

  const getCount = useCallback((id) => activeCounts[id] || 0, [activeCounts]);

  // Merge predefined with active custom rooms from the lobby state — memoized to avoid recalculation on every render
  const activeCustomRooms = useMemo(() =>
    Object.keys(activeCounts)
      .filter(id => id.startsWith('custom-') && activeCounts[id] > 0)
      .map(id => ({
        id,
        name: id.split('-').slice(1, -1).join(' ') || 'Private Study',
        icon: Lock,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        isCustom: true
      })),
  [activeCounts]);

  const allRooms = useMemo(() =>
    [...predefinedRooms, ...activeCustomRooms].filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  [activeCustomRooms, searchQuery]);

  return (
    <div className="py-8 pt-20 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-end mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white transition-colors tracking-tight">Virtual Study Libraries</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 transition-colors uppercase tracking-widest text-sm">Join a room. Focus together.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-lg text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 transition-all outline-none"
            />
          </div>
          <button 
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 bg-slate-800 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wide hover:scale-105 transition-transform"
          >
            Create Custom +
          </button>
        </motion.div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-20 pr-2"
      >
        {allRooms.map((room) => {
          const count = getCount(room.id);
          const Icon = room.icon;
          return (
            <motion.div 
              key={room.id}
              variants={cardItem}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => handleJoin(room.id, room.name)}
              className="bg-[#ffffff] dark:bg-[#000000] rounded-2xl p-6 shadow-sm dark:shadow-none border border-[#e2e8f0] dark:border-[#27272a] hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer transition-all duration-300 relative group overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6 w-full">
                <div className={`p-3 rounded-xl ${room.bg} ${room.color} transition-colors`}>
                  <Icon size={24} />
                </div>
                {count > 0 ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {count} Active
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    Empty
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-black text-slate-800 dark:text-white capitalize transition-colors">{room.name}</h3>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider text-xs">Voice / Text Chat</p>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </motion.div>
          )
        })}

        {allRooms.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
            No rooms found. Create one!
          </div>
        )}
      </motion.div>

      {/* Custom Room Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#ffffff] dark:bg-[#09090b] border border-[#e2e8f0] dark:border-[#27272a] rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
            >
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Create Custom VC</h2>
              <p className="text-sm font-bold text-slate-400 mb-6 tracking-wide">Enter a topic to generate a private room channel.</p>
              
              <form onSubmit={handleCreateCustom}>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="E.g. React Study Group" 
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl px-4 py-3 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-bold mb-6 transition-all"
                />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowCustomModal(false)} className="flex-1 px-4 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={!customRoomName.trim()} className="flex-1 px-4 py-3 font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors">Launch Room</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
