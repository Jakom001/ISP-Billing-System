import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { traineeService } from '../service/traineeService';
import { useAuthContext } from './AuthContext';
import { useEnterpriseContext } from './EnterpriseContext';
import { toast } from 'react-toastify';

// Create the context
const TraineeContext = createContext(null);

// Custom hook to use the context
function useTraineeContext() {
  const context = useContext(TraineeContext);

  if (!context) {
    throw new Error("useTraineeContext must be used within a TraineeProvider");
  }
  return context;
}

// Provider component
function TraineeContextProvider({ children }) {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();
  const { enterprises } = useEnterpriseContext();
  
  // All Trainees
  const fetchTrainees = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await traineeService.getTrainees();

    if (result.data) {
      setTrainees(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // Get Trainee By ID
  const getSingleTrainee = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await traineeService.getTraineeById(id);
    
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

  // Create trainee with user ID
  const addTrainee = useCallback(async (traineeData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a trainee";
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
    
    const result = await traineeService.addTrainee(traineeData);
    
    setLoading(false);
    
    if (result.data) {
      // Find the enterprise object that matches the enterpriseId
      const enterpriseObj = enterprises.find(cat => cat._id === traineeData.enterpriseId);
      
      // Add the new trainee with the full enterprise object to the trainees list
      const newTrainee = {
        ...result.data,
        enterprise: enterpriseObj || { title: "Loading..." } // Fallback in case enterprise isn't found
      };
      
      setTrainees(prevTrainees => [newTrainee, ...prevTrainees]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser, enterprises]);

  // Update trainee
  const updateTrainee = useCallback(async (id, traineeData) => {
    const previousTrainees = [...trainees];

    // Get the enterprise object for the new enterpriseId if it's being updated
    const enterpriseObj = traineeData.enterpriseId 
      ? enterprises.find(cat => cat._id === traineeData.enterpriseId)
      : null;

    // Optimistic update with enterprise data
    setTrainees(prevTrainees =>
      prevTrainees.map(trainee => {
        if (trainee._id === id) {
          return { 
            ...trainee, 
            ...traineeData,
            // Keep existing enterprise if not being updated, otherwise use the new one
            enterprise: enterpriseObj || trainee.enterprise
          };
        }
        return trainee;
      })
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a trainee";
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
    
    const result = await traineeService.updateTrainee(id, traineeData);
    
    setLoading(false);

    if (result.data) {
      // Make sure the updated trainee has the correct enterprise info
      const updatedTrainee = {
        ...result.data,
        enterprise: enterpriseObj || 
                 trainees.find(p => p._id === id)?.enterprise || 
                 { title: "Loading..." }
      };
      
      setTrainees(prevTrainees => 
        prevTrainees.map(trainee => 
          trainee._id === id ? updatedTrainee : trainee
        )
      );
      
    } else {
      setTrainees(previousTrainees);
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
  }, [trainees, currentUser, enterprises]);

  // Delete trainee
  const deleteTrainee = useCallback(async (id) => {
    const previousTrainees = [...trainees];

    // Optimistic update
    setTrainees(prevTrainees =>
      prevTrainees.filter(trainee => trainee._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await traineeService.deleteTrainee(id);
    if (!result.error) {
              toast.success("Trainee deleted successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
    
    setLoading(false);
    

    if (result.error) {
      // Revert to previous state if there was an error
      setTrainees(previousTrainees);
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
  }, [trainees]);

  // Search trainees
  const searchTrainees = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: trainees, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await traineeService.searchTrainee(searchTerm);
    
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
  }, [trainees]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load trainees on mount
  useEffect(() => {
    fetchTrainees();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchTrainees]);


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    trainees,
    loading,
    error,
    clearError,
    fetchTrainees,
    updateTrainee,
    deleteTrainee,
    addTrainee,
    getSingleTrainee,
    searchTrainees,
  }), [
    trainees,
    loading,
    error,
    clearError,
    fetchTrainees,
    updateTrainee,
    deleteTrainee,
    addTrainee,
    getSingleTrainee,
    searchTrainees,
  ]);

  return (
    <TraineeContext.Provider value={contextValue}>
      {children}
    </TraineeContext.Provider>
  );
}

// Export both the hook and provider
export { useTraineeContext, TraineeContextProvider };