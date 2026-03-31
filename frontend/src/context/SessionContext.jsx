import { createContext, useContext, useState, useRef } from 'react';
import api from '../utils/axios';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const timerRef = useRef(null);

  const startSession = async () => {
    const { data } = await api.post('/session/start');
    setSessionInfo({
      id: data._id,
      startTime: new Date(),
      activeTime: 0,
      distractions: 0
    });
  };

  const endSession = async (finalActiveTime, finalDistractions) => {
    if (!sessionInfo?.id) return;

    await api.post('/session/stop', {
      activeTime: finalActiveTime,
      distractionCount: finalDistractions,
    });
    setSessionInfo(null);
  };

  return (
    <SessionContext.Provider value={{ sessionInfo, setSessionInfo, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};
