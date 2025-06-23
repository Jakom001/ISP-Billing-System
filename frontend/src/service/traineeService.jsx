import api from "./api";

export const traineeService = {
  getTrainees: async (params = {}) => {
    try {
      const response = await api.get('/trainee/all-trainees', { params });
      return { data: response.data.data.trainees, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the trainees. Please try again" 
      };
    }
  },

  getTraineeById: async (id) => {
    try {
      const response = await api.get(`/trainee/single-trainee/${id}`);
      return { data: response.data.data.trainee, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the trainee details" 
      };
    }
  },

  addTrainee: async (traineeData) => {
    try {
      const response = await api.post("/trainee/add-trainee", traineeData);
      return { 
        data: response.data.data.trainee, 
        error: null,
        success: response.data.message || "Trainee added successfully" 
      };
    } catch (error) {
      return {
        data: null, 
        error: error.response?.data?.error || "Failed to add the trainee" 
      };
    }
  },

  updateTrainee: async (id, traineeData) => {
    try {
      const response = await api.put(`/trainee/update-trainee/${id}`, traineeData);
      return { data: response.data.data.trainee, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to update the trainee" 
      };
    }
  },

  deleteTrainee: async (id) => {
    try {
      const response = await api.delete(`/trainee/delete-trainee/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to delete the trainee" 
      };
    }
  },

  searchTrainee: async (searchTerm) => {
    try {
      const response = await api.get('/trainee/search', { params: { q: searchTerm } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to search trainees." 
      };
    }
  }
};