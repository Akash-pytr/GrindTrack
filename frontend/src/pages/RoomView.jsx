import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, LogOut, MessageSquare, Mic, MicOff, ShieldCheck, UserMinus } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(true);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [moderatorId, setModeratorId] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'members'
  
  const [seconds, setSeconds] = useState(0);

  const messagesEndRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // socketId -> RTCPeerConnection
  const audioElementsRef = useRef({}); // socketId -> HTMLAudioElement

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Microphone
  const initMicrophone = async (socketId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      
      // Local Speaking Detection
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkLocalSpeaking = () => {
        if (!localStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;

        // Only show speaking if UNMUTED and volume exists
        const isTrackEnabled = localStreamRef.current.getAudioTracks()[0]?.enabled;
        if (average > 15 && isTrackEnabled) {
          setSpeakingUsers(prev => new Set(prev).add(socketId));
        } else {
          setSpeakingUsers(prev => {
            const next = new Set(prev);
            next.delete(socketId);
            return next;
          });
        }
        requestAnimationFrame(checkLocalSpeaking);
      };
      checkLocalSpeaking();

      // Start muted by default
      stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      return stream;
    } catch (err) {
      console.error("Microphone access denied:", err);
      return null;
    }
  };

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5050';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    const startWebRTC = async () => {
      const stream = await initMicrophone(newSocket.id);
      
      newSocket.on('connect', () => {
        newSocket.emit('join-room', { roomId, userName: user?.name || 'Anonymous' });
      });

      newSocket.on('room-users', async ({ users, ownerId }) => {
        setUsers(users);
        setModeratorId(ownerId);
        
        // Logic to initiate peer connections for new users
        for (const remoteUser of users) {
          if (remoteUser.id !== newSocket.id && !peersRef.current[remoteUser.id]) {
            // We initiate if our ID is "greater" than theirs (arbitrary logic to ensure only one offer)
            if (newSocket.id > remoteUser.id) {
              createPeerConnection(remoteUser.id, newSocket, stream, true);
            }
          }
        }
      });

      newSocket.on('rtc-signal', async ({ from, signal }) => {
        if (signal.type === 'offer') {
          const pc = createPeerConnection(from, newSocket, stream, false);
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          newSocket.emit('rtc-signal', { to: from, from: newSocket.id, signal: answer });
        } else if (signal.type === 'answer') {
          const pc = peersRef.current[from];
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (signal.candidate) {
          const pc = peersRef.current[from];
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(signal));
        }
      });

      newSocket.on('user-left', ({ id, message }) => {
        setMessages(prev => [...prev, { id: Date.now(), system: true, text: message }]);
        if (peersRef.current[id]) {
          peersRef.current[id].close();
          delete peersRef.current[id];
        }
        if (audioElementsRef.current[id]) {
          audioElementsRef.current[id].remove();
          delete audioElementsRef.current[id];
        }
      });
    };

    const createPeerConnection = (remoteId, socket, stream, isOfferer) => {
      const pc = new RTCPeerConnection(rtcConfig);
      peersRef.current[remoteId] = pc;

      if (stream) {
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('rtc-signal', { to: remoteId, from: socket.id, signal: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (!audioElementsRef.current[remoteId]) {
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.autoplay = true;
          audioElementsRef.current[remoteId] = audio;
          
          // Audio Analysis for Speaking Indicator
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(remoteStream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);
          
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          const checkSpeaking = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for(let i=0; i<bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;
            
            if (average > 15) { // Threshold for speaking
              setSpeakingUsers(prev => new Set(prev).add(remoteId));
            } else {
              setSpeakingUsers(prev => {
                const next = new Set(prev);
                next.delete(remoteId);
                return next;
              });
            }
            if (peersRef.current[remoteId]) requestAnimationFrame(checkSpeaking);
          };
          checkSpeaking();
        }
      };

      if (isOfferer) {
        pc.onnegotiationneeded = async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('rtc-signal', { to: remoteId, from: socket.id, signal: offer });
        };
      }

      return pc;
    };

    startWebRTC();

    newSocket.on('user-joined', ({ message }) => {
      setMessages(prev => [...prev, { id: Date.now(), system: true, text: message }]);
    });

    newSocket.on('kicked', ({ message }) => {
       alert(message);
       navigate('/libraries');
    });

    newSocket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, [roomId, user]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

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

  const handleKick = (targetId) => {
    if (socket && moderatorId === socket.id) {
       socket.emit('kick-user', { roomId, targetId });
    }
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
        
        <div className="flex justify-between items-center bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl px-6 py-4 shadow-sm dark:neon-border-orange transition-all duration-500">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white capitalize">{roomName}</h1>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Study Session
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={toggleMute}
                className={`p-3 rounded-xl transition-all shadow-lg ${isMuted ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:shadow-neon-blue'}`}
             >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
             </button>
             <button 
                onClick={handleLeave}
                className="flex items-center gap-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wide hover:scale-105 transition-all"
              >
                <LogOut size={16} /> Leave
              </button>
          </div>
        </div>

        <div className="flex-1 bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl shadow-sm overflow-hidden relative flex flex-col items-center justify-center p-8 group transition-all duration-500 dark:neon-border-orange scanline">
          <div className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-[#18181b] px-3 py-1.5 rounded-md border border-transparent dark:border-[#27272a]">
            <Users size={14} /> {users.length} Active
          </div>

          <div className="w-64 h-64 rounded-full border-[6px] border-[#f1f5f9] dark:border-[#27272a] flex items-center justify-center shadow-inner relative transition-colors duration-500">
             {/* Glow */}
             <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-[40px] animate-pulse"></div>
             <div className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter relative z-10 font-sans tabular-nums dark:neon-text-orange">
                {formatTime(seconds)}
             </div>
          </div>
          <p className="mt-8 font-black text-slate-400 uppercase tracking-[0.3em] text-sm">Room Focus Timer</p>

          <div className="absolute bottom-8 flex flex-wrap justify-center gap-4 px-8 w-full">
             {users.map(u => (
               <div key={u.id} className="flex flex-col items-center gap-2">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white relative transition-all ${u.id === socket?.id ? 'bg-brand-500 shadow-neon-orange' : 'bg-slate-700 dark:bg-slate-800'}`}>
                    {u.name.charAt(0).toUpperCase()}
                    {speakingUsers.has(u.id) && (
                      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute inset-0 border-4 border-emerald-400 rounded-full pointer-events-none" />
                    )}
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${speakingUsers.has(u.id) ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>{u.id === socket?.id ? 'You' : u.name}</span>
               </div>
             ))}
          </div>

        </div>

      </div>

      {/* Right Area - Chat & Users Sidebar */}
      <div className="w-[380px] bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl shadow-sm flex flex-col overflow-hidden transition-all duration-500 dark:neon-border-orange">
        
        {/* Sidebar Tabs */}
        <div className="flex border-b border-[#e2e8f0] dark:border-[#27272a] bg-slate-50 dark:bg-[#09090b]">
           <button 
             onClick={() => setActiveTab('chat')}
             className={`flex-1 px-6 py-4 font-black transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'chat' ? 'text-brand-500 bg-white dark:bg-[#000000]' : 'text-slate-400'}`}
           >
             <MessageSquare size={16} /> Chat
           </button>
           <button 
             onClick={() => setActiveTab('members')}
             className={`flex-1 px-6 py-4 font-black transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest ${activeTab === 'members' ? 'text-brand-500 bg-white dark:bg-[#000000]' : 'text-slate-400'}`}
           >
             <Users size={16} /> Members ({users.length})
           </button>
        </div>

        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <AnimatePresence initial={false}>
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
                  className="absolute right-2 text-white bg-brand-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 p-1.5 rounded-lg transition-colors shadow-brand-500/30"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            <AnimatePresence>
              {users.map((u) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-[#e2e8f0] dark:border-[#27272a] hover:border-brand-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white relative ${u.id === socket?.id ? 'bg-brand-500' : 'bg-slate-700'}`}>
                      {u.name.charAt(0).toUpperCase()}
                      {u.id === moderatorId && (
                         <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-white dark:border-black">
                            <ShieldCheck size={8} className="text-white" />
                         </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{u.name} {u.id === socket?.id && '(You)'}</span>
                      {u.id === moderatorId && <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Room Creator</span>}
                    </div>
                  </div>

                  {socket?.id === moderatorId && u.id !== socket?.id && (
                    <button 
                      onClick={() => handleKick(u.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Kick User"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
