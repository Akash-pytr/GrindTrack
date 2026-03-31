import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

export default function RoomView() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const roomName = location.state?.roomName || roomId.split('-').join(' ');

  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  
  // Shared global pseudo-timer for the room (just visual sync for MVP)
  const [seconds, setSeconds] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Room Timer logic (starts from 0 when component mounts just as visual sync)
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5050';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-room', { roomId, userName: user?.name || 'Anonymous' });
    });

    newSocket.on('room-users', (currentUsers) => {
      setUsers(currentUsers);
    });

    newSocket.on('user-joined', ({ message }) => {
      setMessages(prev => [...prev, { id: Date.now(), system: true, text: message }]);
    });

    newSocket.on('user-left', ({ message }) => {
      setMessages(prev => [...prev, { id: Date.now(), system: true, text: message }]);
    });

    newSocket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, user]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !socket) return;
    
    socket.emit('send-message', {
      roomId,
      message: msgInput,
      userName: user?.name || 'Anonymous'
    });
    setMsgInput('');
  };

  const handleLeave = () => {
    if (socket) socket.emit('leave-room');
    navigate('/libraries');
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pt-20 pb-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex gap-6">
      
      {/* Left Area - Video/Timer Area */}
      <div className="flex-1 flex flex-col gap-6">
        
        <div className="flex justify-between items-center bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl px-6 py-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white capitalize">{roomName}</h1>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Study Session
            </p>
          </div>
          <button 
            onClick={handleLeave}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wide hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Leave
          </button>
        </div>

        <div className="flex-1 bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl shadow-sm overflow-hidden relative flex flex-col items-center justify-center p-8 group">
          <div className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-[#18181b] px-3 py-1.5 rounded-md">
            <Users size={14} /> {users.length} Active
          </div>

          <div className="w-64 h-64 rounded-full border-[6px] border-[#f1f5f9] dark:border-[#27272a] flex items-center justify-center shadow-inner relative transition-colors duration-500">
             {/* Glow */}
             <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-[40px]"></div>
             <div className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter relative z-10 font-sans tabular-nums">
                {formatTime(seconds)}
             </div>
          </div>
          <p className="mt-8 font-black text-slate-400 uppercase tracking-[0.3em] text-sm">Room Focus Timer</p>

        </div>

      </div>

      {/* Right Area - Chat & Users */}
      <div className="w-[380px] bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl shadow-sm flex flex-col overflow-hidden">
        
        <div className="px-6 py-4 border-b border-[#e2e8f0] dark:border-[#27272a] bg-slate-50 border-box dark:bg-[#09090b]">
           <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm flex items-center gap-2">
             <MessageSquare size={16} className="text-brand-500" /> Room Chat
           </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id + i}
                className={`text-sm ${msg.system ? 'text-center my-2' : ''}`}
              >
                {msg.system ? (
                  <span className="bg-slate-100 dark:bg-[#18181b] text-slate-400 dark:text-slate-500 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">{msg.text}</span>
                ) : (
                  <div className={`flex flex-col ${msg.sender === user?.name ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 px-1">{msg.sender} • {msg.timestamp}</span>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] font-medium ${msg.sender === user?.name ? 'bg-brand-500 text-white rounded-br-sm shadow-md' : 'bg-slate-100 dark:bg-[#18181b] text-slate-800 dark:text-slate-200 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-[#e2e8f0] dark:border-[#27272a] bg-slate-50 dark:bg-[#09090b]">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Message room..."
              className="w-full bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] text-slate-800 dark:text-white rounded-xl py-3 pl-4 pr-12 text-sm font-semibold outline-none focus:border-brand-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!msgInput.trim()}
              className="absolute right-2 text-white bg-brand-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 p-1.5 rounded-lg transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
