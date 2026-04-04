import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, LogOut, MessageSquare, Mic, MicOff, ShieldCheck, UserMinus, Video, VideoOff, MonitorUp, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import api from '../utils/axios';
import { io } from 'socket.io-client';

export default function RoomView() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessionInfo, startSession, endSession } = useSession();
  
  const roomName = location.state?.roomName || roomId.split('-').join(' ');

  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [moderatorId, setModeratorId] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'members'
  
  // Room permissions states
  const [canEnableCamera, setCanEnableCamera] = useState(false);
  const [canScreenShare, setCanScreenShare] = useState(false);
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  
  const [seconds, setSeconds] = useState(0);

  const messagesEndRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // socketId -> RTCPeerConnection
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> MediaStream
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

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
      // Only increment time if video or screen share is ON
      if (isCameraOn || isScreenSharing) {
        setSeconds(s => s + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCameraOn, isScreenSharing]);

  // Handle Session Start/Stop
  useEffect(() => {
    // Start session when successfully joined
    if (socket && user && !sessionInfo) {
      startSession();
    }

    return () => {
      // Small ref trick or state to handle unmount session stop
    };
  }, [socket, user]);

  // Use a ref to track current seconds for endSession cleanup
  const secondsRef = useRef(0);
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    return () => {
       if (secondsRef.current > 0) {
          endSession(secondsRef.current, 0);
       }
    };
  }, []);

  // Fetch room permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data } = await api.get(`/rooms/${roomId}/permissions`);
        setCanEnableCamera(data.canEnableCamera);
        setCanScreenShare(data.canScreenShare);
        setIsRoomOwner(data.isCreator);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        // Default: no permissions for prebuilt rooms
        setCanEnableCamera(false);
        setCanScreenShare(false);
        setIsRoomOwner(false);
      } finally {
        setPermissionsLoading(false);
      }
    };

    if (user) {
      fetchPermissions();
    }
  }, [roomId, user]);

  // Initialize Media (Audio/Video)
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
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
          setSpeakingUsers(prev => new Set(prev).add(socket?.id || 'local'));
        } else {
          setSpeakingUsers(prev => {
            const next = new Set(prev);
            next.delete(socket?.id || 'local');
            return next;
          });
        }
        requestAnimationFrame(checkLocalSpeaking);
      };
      checkLocalSpeaking();

      // Always start muted when joining a room
      stream.getAudioTracks().forEach(track => track.enabled = false);
      return stream;
    } catch (err) {
      console.error("Media access denied:", err);
      return null;
    }
  };

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Set up all event listeners FIRST before any connections
    newSocket.on('room-users', ({ users, ownerId }) => {
      console.log('Received room-users:', users);
      setUsers(users);
      setModeratorId(ownerId);
    });

    newSocket.on('user-joined', ({ message }) => {
      setMessages(prev => [...prev, { id: Date.now(), system: true, text: message }]);
    });

    newSocket.on('user-left', ({ id, message }) => {
      console.log('User left:', id);
      setMessages(prev => [...prev, { id: Date.now(), system: true, text: message }]);
      if (peersRef.current[id]) {
        peersRef.current[id].close();
        delete peersRef.current[id];
      }
      setRemoteStreams(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSpeakingUsers(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });

    newSocket.on('kicked', ({ message }) => {
      alert(message);
      navigate('/libraries');
    });

    newSocket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('rtc-signal', async ({ from, signal }) => {
      if (signal.type === 'offer') {
        const pc = createPeerConnection(from, newSocket, localStreamRef.current, false);
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

    // Now handle connection and join room
    const handleConnection = async () => {
      const stream = await initMedia();
      localStreamRef.current = stream;

      const joinRoom = () => {
        console.log('Socket connected or already connected, joining room...');
        newSocket.emit('join-room', { roomId, userName: user?.name || 'Anonymous' });
      };

      if (newSocket.connected) {
        joinRoom();
      } else {
        newSocket.on('connect', joinRoom);
      }
    };

    handleConnection();

    return () => {
      newSocket.disconnect();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
    };
  }, [roomId, user]);

  // Create peer connections when users join
  useEffect(() => {
    if (!socket || !localStreamRef.current) return;

    // Create peer connections for new users
    for (const remoteUser of users) {
      if (remoteUser.id !== socket.id && !peersRef.current[remoteUser.id]) {
        // We initiate if our ID is "greater" than theirs (arbitrary logic to ensure only one offer)
        if (socket.id > remoteUser.id) {
          createPeerConnection(remoteUser.id, socket, localStreamRef.current, true);
        }
      }
    }
  }, [users, socket]);

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
      setRemoteStreams(prev => ({
        ...prev,
        [remoteId]: remoteStream
      }));
      
      // If it's an audio track, handle speaking indicator
      if (event.track.kind === 'audio') {
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

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = async () => {
    // Check permission before allowing camera toggle
    if (!canEnableCamera) {
      alert('Camera access is initializing. Please wait.');
      return;
    }

    try {
      if (!isCameraOn) {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = videoStream.getVideoTracks()[0];
        
        localStreamRef.current.addTrack(videoTrack);
        
        // Add track to all peers
        Object.values(peersRef.current).forEach(pc => {
          pc.addTrack(videoTrack, localStreamRef.current);
        });
        
        setIsCameraOn(true);
      } else {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
          localStreamRef.current.removeTrack(videoTrack);
          
          // Remove track from all peers (negotiation needed)
          Object.values(peersRef.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) pc.removeTrack(sender);
          });
        }
        setIsCameraOn(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const toggleScreenShare = async () => {
    // Check permission before allowing screen share
    if (!canScreenShare) {
      alert('Screen share access is initializing. Please wait.');
      return;
    }

    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Handle screen share stop from browser UI
        screenTrack.onended = () => {
          stopScreenShare(screenTrack);
        };

        // Add track to all peers
        Object.values(peersRef.current).forEach(pc => {
          pc.addTrack(screenTrack, localStreamRef.current);
        });
        
        setIsScreenSharing(true);
      } else {
        const screenTracks = localStreamRef.current.getTracks().filter(t => t.label.includes('screen') || t.kind === 'video');
        // This is a bit tricky since localStream might have both cam and screen.
        // For simplicity, let's assume if screen sharing is active, one of the video tracks is the screen.
        const videoTrack = localStreamRef.current.getVideoTracks().find(t => t.readyState === 'live');
        if (videoTrack) stopScreenShare(videoTrack);
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = (track) => {
    track.stop();
    Object.values(peersRef.current).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track === track);
      if (sender) pc.removeTrack(sender);
    });
    setIsScreenSharing(false);
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
                title={isMuted ? "Unmute" : "Mute"}
                className={`p-3 rounded-xl transition-all shadow-lg ${isMuted ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:shadow-neon-blue'}`}
             >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
             </button>
             <div className="relative group">
               <button 
                  onClick={canEnableCamera ? toggleCamera : null}
                  disabled={!canEnableCamera}
                  title={canEnableCamera ? (isCameraOn ? "Turn Camera Off" : "Turn Camera On") : "Camera not available in this room"}
                  className={`p-3 rounded-xl transition-all shadow-lg ${
                    !canEnableCamera 
                      ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20 cursor-not-allowed opacity-50' 
                      : !isCameraOn 
                        ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20' 
                        : 'bg-brand-500/10 text-brand-500 border border-brand-500/20 shadow-neon-orange'
                  }`}
               >
                  {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
               </button>
               {!canEnableCamera && (
                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-40 flex items-center gap-1">
                   <Lock size={12} /> Connecting...
                 </div>
               )}
             </div>
             <div className="relative group">
               <button 
                  onClick={canScreenShare ? toggleScreenShare : null}
                  disabled={!canScreenShare}
                  title={canScreenShare ? (isScreenSharing ? "Stop Sharing" : "Share Screen") : "Screen sharing not available in this room"}
                  className={`p-3 rounded-xl transition-all shadow-lg ${
                    !canScreenShare 
                      ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20 cursor-not-allowed opacity-50' 
                      : !isScreenSharing 
                        ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20' 
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-neon-blue'
                  }`}
               >
                  <MonitorUp size={20} />
               </button>
               {!canScreenShare && (
                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-40 flex items-center gap-1">
                   <Lock size={12} /> Connecting...
                 </div>
               )}
             </div>
             <button 
                onClick={() => {
                   if (seconds > 0) endSession(seconds, 0);
                   handleLeave();
                }}
                className="flex items-center gap-2 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg font-black text-sm uppercase tracking-wide hover:scale-105 transition-all"
              >
                <LogOut size={16} /> Leave
              </button>
          </div>
        </div>

        <div className="flex-1 bg-[#ffffff] dark:bg-[#000000] border border-[#e2e8f0] dark:border-[#27272a] rounded-xl shadow-sm overflow-hidden relative flex flex-col items-center justify-center transition-all duration-500 dark:neon-border-orange scanline">
          
          {/* Main Grid View */}
          <div className="w-full h-full p-4 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              
              {/* Local Stream */}
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group">
                {isCameraOn ? (
                    <video 
                      autoPlay 
                      muted 
                      playsInline 
                      ref={video => { if (video && video.srcObject !== localStreamRef.current) video.srcObject = localStreamRef.current; }}
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-white bg-brand-500 shadow-neon-orange`}>
                        {user?.name.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">You (Mic Only)</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                  <span className="text-[10px] font-black text-white uppercase">{user?.name} (You)</span>
                  {speakingUsers.has(socket?.id) && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon-blue" />}
                </div>
              </div>

              {/* Remote Streams */}
              {users.filter(u => u.id !== socket?.id).map((u) => (
                <div key={u.id} className="relative aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group">
                  {remoteStreams[u.id] ? (
                    <>
                      <video 
                        autoPlay 
                        playsInline 
                        ref={video => { if (video && video.srcObject !== remoteStreams[u.id]) video.srcObject = remoteStreams[u.id]; }}
                        className="w-full h-full object-cover"
                      />
                      {/* Audio is handled by the video element above — no separate <audio> needed */}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                       <div className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-white bg-slate-700`}>
                          {u.name.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">{u.name} (Mic Only)</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                    <span className="text-[10px] font-black text-white uppercase">{u.name}</span>
                    {speakingUsers.has(u.id) && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon-blue" />}
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Floating Focus Timer */}
          <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-20">
            <div className={`flex items-center gap-4 ${isCameraOn || isScreenSharing ? 'bg-white/90 dark:bg-black/80' : 'bg-orange-500/10'} backdrop-blur-md px-6 py-3 rounded-2xl border border-[#e2e8f0] dark:border-[#27272a] shadow-xl transition-all duration-500`}>
               <div className={`w-2 h-2 rounded-full ${isCameraOn || isScreenSharing ? 'bg-emerald-500 animate-pulse shadow-neon-blue' : 'bg-orange-500 shadow-neon-orange'} `}></div>
               <div className={`text-2xl font-black tabular-nums tracking-tight ${isCameraOn || isScreenSharing ? 'text-slate-800 dark:text-white dark:neon-text-orange' : 'text-orange-500'}`}>
                  {formatTime(seconds)}
               </div>
            </div>
            {!isCameraOn && !isScreenSharing && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-orange-500/20"
               >
                 Turn on camera or screen to count time
               </motion.div>
            )}
            {(isCameraOn || isScreenSharing) && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-500/20"
               >
                 Study session being recorded
               </motion.div>
            )}
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
