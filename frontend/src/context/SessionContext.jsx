import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { sessionService } from '../service/sessionService';
import { useAuthContext } from './AuthContext';
import { useEnterpriseContext } from './EnterpriseContext';

// Create the context
const SessionContext = createContext(null);

// Custom hook to use the context
function useSessionContext() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}

// Provider component
function SessionContextProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();
  const { enterprises } = useEnterpriseContext();
  
  // All Sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await sessionService.getSessions();

    if (result.data) {
      setSessions(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // Get Session By ID
  const getSingleSession = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await sessionService.getSessionById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Create session with user ID
  const addSession = useCallback(async (sessionData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a session";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    
    
    const result = await sessionService.addSession(sessionData);
    
    setLoading(false);
    
    if (result.data) {
      // Find the enterprise object that matches the enterpriseId
      const enterpriseObj = enterprises.find(cat => cat._id === sessionData.enterpriseId);
      
      // Add the new session with the full enterprise object to the sessions list
      const newSession = {
        ...result.data,
        enterprise: enterpriseObj || { title: "Loading..." } // Fallback in case enterprise isn't found
      };
      
      setSessions(prevSessions => [newSession, ...prevSessions]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser, enterprises]);

  // Update session
  const updateSession = useCallback(async (id, sessionData) => {
    const previousSessions = [...sessions];

    // Get the enterprise object for the new enterpriseId if it's being updated
    const enterpriseObj = sessionData.enterpriseId 
      ? enterprises.find(cat => cat._id === sessionData.enterpriseId)
      : null;

    // Optimistic update with enterprise data
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session._id === id) {
          return { 
            ...session, 
            ...sessionData,
            // Keep existing enterprise if not being updated, otherwise use the new one
            enterprise: enterpriseObj || session.enterprise
          };
        }
        return session;
      })
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a session";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    const result = await sessionService.updateSession(id, sessionData);
    
    setLoading(false);

    if (result.data) {
      // Make sure the updated session has the correct enterprise info
      const updatedSession = {
        ...result.data,
        enterprise: enterpriseObj || 
                 sessions.find(p => p._id === id)?.enterprise || 
                 { title: "Loading..." }
      };
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session._id === id ? updatedSession : session
        )
      );
    } else {
      setSessions(previousSessions);
      setError(result.error);
    }
    
    return result;
  }, [sessions, currentUser, enterprises]);

  // Delete session
  const deleteSession = useCallback(async (id) => {
    const previousSessions = [...sessions];

    // Optimistic update
    setSessions(prevSessions =>
      prevSessions.filter(session => session._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await sessionService.deleteSession(id);
    
    setLoading(false);

    if (result.error) {
      // Revert to previous state if there was an error
      setSessions(previousSessions);
      setError(result.error);
    }
    
    return result;
  }, [sessions]);

  // Search sessions
  const searchSessions = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: sessions, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await sessionService.searchSession(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [sessions]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchSessions]);


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    sessions,
    loading,
    error,
    clearError,
    fetchSessions,
    updateSession,
    deleteSession,
    addSession,
    getSingleSession,
    searchSessions,
  }), [
    sessions,
    loading,
    error,
    clearError,
    fetchSessions,
    updateSession,
    deleteSession,
    addSession,
    getSingleSession,
    searchSessions,
  ]);

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// Export both the hook and provider
export { useSessionContext, SessionContextProvider };