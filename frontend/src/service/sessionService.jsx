import api from "./api";

export const sessionService = {
  getSessions: async (params = {}) => {
    try {
      const response = await api.get('/session/all-sessions', { params });
      return { data: response.data.data.sessions, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the sessions. Please try again" 
      };
    }
  },

  getSessionById: async (id) => {
    try {
      const response = await api.get(`/session/single-session/${id}`);
      return { data: response.data.data.session, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the session details" 
      };
    }
  },

  addSession: async (sessionData) => {
    try {
      const response = await api.post("/session/add-session", sessionData);
      return { 
        data: response.data.data.session, 
        error: null,
        success: response.data.message || "Session added successfully" 
      };
    } catch (error) {
      return {
        data: null, 
        error: error.response?.data?.error || "Failed to add the session" 
      };
    }
  },

  updateSession: async (id, sessionData) => {
    try {
      const response = await api.put(`/session/update-session/${id}`, sessionData);
      return { data: response.data.data.session, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to update the session" 
      };
    }
  },

  deleteSession: async (id) => {
    try {
      const response = await api.delete(`/session/delete-session/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to delete the session" 
      };
    }
  },

  searchSession: async (searchTerm) => {
    try {
      const response = await api.get('/session/search', { params: { q: searchTerm } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to search sessions." 
      };
    }
  }
};