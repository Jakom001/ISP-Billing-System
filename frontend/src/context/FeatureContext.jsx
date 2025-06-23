import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { featureService } from '../service/featureService';
import { useAuthContext } from './AuthContext';

// Create the context
const FeatureContext = createContext(null);

// Custom hook to use the context
function useFeatureContext() {
  const context = useContext(FeatureContext);

  if (!context) {
    throw new Error("useFeatureContext must be used within a FeatureProvider");
  }
  return context;
}

// Provider component
function FeatureContextProvider({ children }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser, isAdmin } = useAuthContext();
  
  // All Features
  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await featureService.getFeatures();

    if (result.data) {
      setFeatures(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // const fetchAdminFeatures = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  //   const result = await featureService.getProposedFeatures();

  //   if (result.data) {
  //     setFeatures(result.data);
  //   } else {
  //     setError(result.error);
  //   }
    
  //   setLoading(false);
  //   return result;
  // }, []);

  // Get Feature By ID
  const getSingleFeature = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await featureService.getFeatureById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Create feature with user ID
  const addFeature = useCallback(async (featureData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a feature";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
   
    
    const result = await featureService.addFeature(featureData);
    setLoading(false);
    
    if (result.data) {
      setFeatures(prevFeatures => [result.data, ...prevFeatures]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]);

  // Update feature
  const updateFeature = useCallback(async (id, featureData) => {
    const previousFeatures = [...features];

    // Optimistic update
    setFeatures(prevFeatures =>
      prevFeatures.map(feature =>
        feature._id === id ? { ...feature, ...featureData } : feature
      )
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a feature";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }

    
    const result = await featureService.updateFeature(id, featureData);
    
    setLoading(false);

    if (result.data) {
      setFeatures(prevFeatures => 
        prevFeatures.map(feature => 
          feature._id === id ? result.data : feature
        )
      );
    } else {
      setFeatures(previousFeatures);
      setError(result.error);
    }
    
    return result;
  }, [features, currentUser]);

  // Delete feature
  const deleteFeature = useCallback(async (id) => {
    const previousFeatures = [...features];

    // Optimistic update
    setFeatures(prevFeatures =>
      prevFeatures.filter(feature => feature._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await featureService.deleteFeature(id);
    
    setLoading(false);

    if (result.error) {
      // Revert to previous state if there was an error
      setFeatures(previousFeatures);
      setError(result.error);
    }
    
    return result;
  }, [features]);

  // Search features
  const searchFeatures = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: features, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await featureService.searchFeature(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [features]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load features on mount
  useEffect(() => {
    fetchFeatures();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchFeatures]);


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    features,
    loading,
    error,
    clearError,
    fetchFeatures,
    updateFeature,
    deleteFeature,
    addFeature,
    getSingleFeature,
    searchFeatures,
  }), [
    features,
    loading,
    error,
    clearError,
    fetchFeatures,
    updateFeature,
    deleteFeature,
    addFeature,
    getSingleFeature,
    searchFeatures,
  ]);

  return (
    <FeatureContext.Provider value={contextValue}>
      {children}
    </FeatureContext.Provider>
  );
}

// Export both the hook and provider
export { useFeatureContext, FeatureContextProvider };