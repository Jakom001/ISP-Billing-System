import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { enterpriseService } from '../service/enterpriseService';
import { useAuthContext } from './AuthContext';

// Create the context
const EnterpriseContext = createContext(null);

// Custom hook to use the context
function useEnterpriseContext() {
  const context = useContext(EnterpriseContext);

  if (!context) {
    throw new Error("useEnterpriseContext must be used within a EnterpriseProvider");
  }
  return context;
}

// Provider component
function EnterpriseContextProvider({ children }) {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();
  
  // All Enterprises
  const fetchEnterprises = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await enterpriseService.getEnterprises();
    
    if (result.data) {
      setEnterprises(result.data);
    } else {
      setError(result.error);
      toast.error(result.error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    setLoading(false);
    return result;
  }, []);

  // Get Enterprise By ID
  const getSingleEnterprise = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await enterpriseService.getEnterpriseById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    return result;
  }, []);

  // Create enterprise with user ID
  const addEnterprise = useCallback(async (enterpriseData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a enterprise";
      setError(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return { data: null, error: errorMsg };
    }
    
    const result = await enterpriseService.addEnterprise(enterpriseData);
    
    setLoading(false);
    
    if (result.data) {
      setEnterprises(prevEnterprises => [result.data, ...prevEnterprises]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]);

  // Update enterprise
  const updateEnterprise = useCallback(async (id, enterpriseData) => {
    const previousEnterprises = [...enterprises];

    // Optimistic update
    setEnterprises(prevEnterprises =>
      prevEnterprises.map(enterprise =>
        enterprise._id === id ? { ...enterprise, ...enterpriseData } : enterprise
      )
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a enterprise";
      setError(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return { data: null, error: errorMsg };
    }
    
    const result = await enterpriseService.updateEnterprise(id, enterpriseData);
    
    setLoading(false);

    if (result.data) {
      setEnterprises(prevEnterprises => 
        prevEnterprises.map(enterprise => 
          enterprise._id === id ? result.data : enterprise
        )
      );
      
    } else {
      setEnterprises(previousEnterprises);
      setError(result.error);
      toast.error(result.error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    return result;
  }, [enterprises, currentUser]);

  // Delete enterprise
  const deleteEnterprise = useCallback(async (id) => {
    const previousEnterprises = [...enterprises];

    // Optimistic update
    setEnterprises(prevEnterprises =>
      prevEnterprises.filter(enterprise => enterprise._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await enterpriseService.deleteEnterprise(id);
    console.log(result)
    setLoading(false);

    if (!result.error) {
      toast.success("Enterprise deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      // Revert to previous state if there was an error
      setEnterprises(previousEnterprises);
      setError(result.error);
      toast.error(result.error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    return result;
  }, [enterprises]);

  // Search enterprises
  const searchEnterprises = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: enterprises, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await enterpriseService.searchEnterprise(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
      toast.error(result.error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    return result;
  }, [enterprises]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load enterprises on mount
  useEffect(() => {
    fetchEnterprises();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchEnterprises]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    enterprises,
    loading,
    error,
    clearError,
    fetchEnterprises,
    updateEnterprise,
    deleteEnterprise,
    addEnterprise,
    getSingleEnterprise,
    searchEnterprises,
  }), [
    enterprises,
    loading,
    error,
    clearError,
    fetchEnterprises,
    updateEnterprise,
    deleteEnterprise,
    addEnterprise,
    getSingleEnterprise,
    searchEnterprises,
  ]);

  return (
    <EnterpriseContext.Provider value={contextValue}>
      {children}
    </EnterpriseContext.Provider>
  );
}

// Export both the hook and provider
export { useEnterpriseContext, EnterpriseContextProvider };