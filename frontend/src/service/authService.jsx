import api from './api';

// Function to handle user login
export const loginUser = async (formData) => {
  try {
    const response = await api.post('/auth/login', formData, { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.error || 'Something went wrong. Please try again!'
    };
  }
};

// Function to handle user registration
export const registerUser = async (formData) => {
  try {
    const response = await api.post('/auth/register', formData, { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.error || 'Registration failed!. Please try again'
    };
  }
};

// Function to get current user info
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/current-user', { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.error || 'Failed to get user info'
    };
  }
};

export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/auth/all-users', { params });
    return { data: response.data.data.users, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.error || "Failed to fetch the users. Please try again" 
    };
  }
}

export const searchUser = async (searchTerm) => {
  try {
    const response = await api.get('/auth/search', { params: { q: searchTerm } });
    return { data: response.data.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.error || "Failed to search users." 
    };
  }
}

// Function to handle user logout
export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout', {}, { withCredentials: true });
    return { success: true, data: response.data, error: null };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.error || 'Logout failed!'
    };
  }
};

// Function to refresh access token
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh', {}, { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.error || 'Failed to refresh token'
    };
  }
};

// Other auth functions remain the same
export const changePassword = async (formData) => {
  try {
    const response = await api.patch('/auth/change-password', formData, { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to change password' };
  }
};

export const requestVerificationCode = async () => {
  try {
    const response = await api.patch('/auth/send-verification-code', {}, { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to send verification code' };
  }
};

export const verifyAccount = async (code) => {
  try {
    const response = await api.patch('/auth/verify-verification-code', { providedCode: code }, { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to verify account' };
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.patch('/auth/send-forgot-password-code', { email }, { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to send reset code' };
  }
};

export const resetPassword = async (formData) => {
  try {
    const response = await api.patch('/auth/verify-forgot-password-code', formData, { withCredentials: true });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error || 'Failed to reset password' };
  }
};