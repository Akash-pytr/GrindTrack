import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/axios';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [sessionInfo, setSessionInfo] = useState(null);

  const startSession = useCallback(async () => {
    try {
      const { data } = await api.post('/session/start');
      setSessionInfo({
        id: data._id,
        startTime: new Date(),
        activeTime: 0,
        distractions: 0
      });
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }, []);

  const endSession = useCallback(async (finalActiveTime, finalDistractions) => {
    if (!sessionInfo?.id) return;
    try {
      await api.post('/session/stop', {
        activeTime: finalActiveTime,
        distractionCount: finalDistractions,
      });
    } catch (err) {
      console.error('Failed to end session:', err);
    } finally {
      setSessionInfo(null);
    }
  }, [sessionInfo?.id]);

  return (
    <SessionContext.Provider value={{ sessionInfo, setSessionInfo, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};
