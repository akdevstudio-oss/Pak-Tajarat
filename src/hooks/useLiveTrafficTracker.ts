import { useEffect, useRef } from 'react';
import { sendLiveHeartbeat, initGlobalClickTracker } from '../services/liveTrafficTracker';

export function useLiveTrafficTracker(currentView: string, currentUser?: any) {
  const currentViewRef = useRef(currentView);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentViewRef.current = currentView;
    currentUserRef.current = currentUser;
  }, [currentView, currentUser]);

  useEffect(() => {
    // Initialize global click listener once
    initGlobalClickTracker(
      () => currentViewRef.current,
      () => currentUserRef.current
    );

    // Send immediate heartbeat on view change
    sendLiveHeartbeat(currentView, currentUser);

    // Set recurring 25s heartbeat to keep live active session alive
    const interval = setInterval(() => {
      sendLiveHeartbeat(currentViewRef.current, currentUserRef.current);
    }, 25000);

    // Heartbeat on tab focus / visibility return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendLiveHeartbeat(currentViewRef.current, currentUserRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentView, currentUser?.id]);
}
