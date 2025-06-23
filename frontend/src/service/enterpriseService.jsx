import api from "./api";

export const enterpriseService = {
  getEnterprises: async (params = {}) => {
    try {
      const response = await api.get('/enterprise/all-enterprises', { params });
      return { data: response.data.data.enterprises, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the enterprises. Please try again" 
      };
    }
  },

  getEnterpriseById: async (id) => {
    try {
      const response = await api.get(`/enterprise/single-enterprise/${id}`);
      return { data: response.data.data.enterprise, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the enterprise details" 
      };
    }
  },

  addEnterprise: async (enterpriseData) => {
    try {
      const response = await api.post("/enterprise/add-enterprise", enterpriseData);
      return { 
        data: response.data.data.enterprise, 
        error: null,
        success: response.data.message || "Enterprise added successfully" 
      };
    } catch (error) {
      return {
        data: null, 
        error: error.response?.data?.error || "Failed to add the enterprise" 
      };
    }
  },

  updateEnterprise: async (id, enterpriseData) => {
    try {
      const response = await api.put(`/enterprise/update-enterprise/${id}`, enterpriseData);
      return { data: response.data.data.enterprise, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to update the enterprise" 
      };
    }
  },

  deleteEnterprise: async (id) => {
    try {
      const response = await api.delete(`/enterprise/delete-enterprise/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to delete the enterprise" 
      };
    }
  },

  searchEnterprise: async (searchTerm) => {
    try {
      const response = await api.get('/enterprise/search', { params: { q: searchTerm } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to search enterprises." 
      };
    }
  }
};