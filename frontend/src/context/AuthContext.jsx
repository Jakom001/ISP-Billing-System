import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';

import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  requestVerificationCode, 
  verifyAccount, 
  logoutUser, 
  requestPasswordReset, 
  changePassword, 
  resetPassword, 
  getUsers, 
  searchUser 
} from '../service/authService';

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);

  // Utility function to check if user is logged in via cookie
  const isLoggedInViaCookie = useCallback(() => {
    return document.cookie.split(';').some(c => c.trim().startsWith('isLoggedIn=true'));
  }, []);

  // Check if user is authenticated on mount
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    // Check if logged in cookie exists
    if (!isLoggedInViaCookie()) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
  
    try {
      // Validate authentication by fetching current user
      const result = await getCurrentUser();
      
      if (result.data) {
        const user = result.data.user;
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Set admin status based on user role
        setIsAdmin(user.role === 'admin' || user.isAdmin === true);
        
      } else {
        // Handle auth failure
        handleAuthFailure(result.error);
      }
    } catch (err) {
      handleAuthFailure(err.message || 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  }, [isLoggedInViaCookie]);

  const handleAuthFailure = useCallback((errorMessage) => {
    console.log("Auth failure:", errorMessage);
    
    // Clear client-side auth state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setUsers([]);
    setError(errorMessage);
  }, []);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleLogoutEvent = () => {
      handleAuthFailure('Session expired');
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [handleAuthFailure]);

  // All users - only fetch when authenticated
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) {
      console.log("Cannot fetch users: user not authenticated or not admin");
      return { data: null, error: "User not authenticated" };
    }

    setLoading(true);
    setError(null);
    const result = await getUsers();
    
    if (result.data) {
      setUsers(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, [isAuthenticated, isAdmin]);

  // Login function
  const login = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    const result = await loginUser(formData);
    
    if (result.data) {
      setIsAuthenticated(true);
      
      // Fetch user details after successful login
      const userResult = await getCurrentUser();
      if (userResult.data && userResult.data.user) {
        const user = userResult.data.user;
        setCurrentUser(user);
        
        // Set admin status based on user role
        setIsAdmin(user.role === 'admin' || user.isAdmin === true);
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // Register function
  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    const result = await registerUser(formData);
    
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // API call to logout - will clear cookies server-side
      const result = await logoutUser();
      
      // Clear client-side auth state
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsAdmin(false);
      setUsers([]);
      
      if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear auth state even if API call fails
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsAdmin(false);
      setUsers([]);
      setError("Logout failed, but you've been logged out locally");
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check authentication status on mount and periodically
  useEffect(() => {
    checkAuthStatus();
    
    // Set up a timer to check auth status periodically
    const authCheckInterval = setInterval(() => {
      // Only check if we think we're authenticated
      if (isLoggedInViaCookie()) {
        checkAuthStatus();
      } else if (isAuthenticated) {
        // Cookie is gone but state says authenticated - clear state
        handleAuthFailure('Session expired');
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(authCheckInterval);
  }, [checkAuthStatus, isLoggedInViaCookie, isAuthenticated, handleAuthFailure]);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    const result = await getCurrentUser();
    
    if (result.data) {
      const user = result.data.user;
      setCurrentUser(user);
      
      // Update admin status
      setIsAdmin(user.role === 'admin' || user.isAdmin === true);
    } else {
      if (result.error === 'Unauthorized' || result.error?.includes('token')) {
        // Handle token expiration
        await logout();
      }
      setError(result.error);
    }
    setLoading(false);
  }, [isAuthenticated, logout]);

  // Change password
  const changeUserPassword = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    const result = await changePassword(formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);
  
  // Verify account
  const verifyUserAccount = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    
    const result = await verifyAccount(code);
    
    if (result.data && currentUser) {
      // Update user verification status
      setCurrentUser({...currentUser, verified: true});
    }
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]);

  // Request password reset (send email with code)
  const requestPasswordResetCode = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    const result = await requestPasswordReset(email);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Reset password with verification code
  const resetPasswordWithCode = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    const result = await resetPassword(formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Search users - only when authenticated
  const searchUsers = useCallback(async (searchTerm) => {
    if (!isAuthenticated || !isAdmin) {
      return { data: null, error: "User not authenticated" };
    }

    if (!searchTerm.trim()) {
      // If no search term, return current users
      return {data: users, error: null}
    }
    
    setLoading(true);
    setError(null);
    
    const result = await searchUser(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [users, isAuthenticated, isAdmin]);
  
  // Load users only when authenticated
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin, fetchUsers]);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    currentUser,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    refreshUserData,
    clearError,
    checkAuthStatus,
    changeUserPassword,
    verifyUserAccount,
    requestVerificationCode,
    requestPasswordResetCode,
    resetPasswordWithCode,
    searchUsers,
    users,
    fetchUsers,
  }), [
    currentUser,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    refreshUserData,
    clearError,
    checkAuthStatus,
    changeUserPassword,
    verifyUserAccount,
    requestPasswordResetCode,
    resetPasswordWithCode,
    searchUsers,
    users,
    fetchUsers,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;