import api from "./api";

export const featureService = {
  getFeatures: async (params = {}) => {
    try {
      const response = await api.get('/feature/all-features', { params });
      return { data: response.data.data.features, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the features. Please try again" 
      };
    }
  },
  getProposedFeatures: async (params = {}) => {
    try {
      const response = await api.get('/feature/all-proposed-features', { params });
      return { data: response.data.data.features, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the features. Please try again" 
      };
    }
  },

  getFeatureById: async (id) => {
    try {
      const response = await api.get(`/feature/single-feature/${id}`);
      return { data: response.data.data.feature, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the feature details" 
      };
    }
  },

  addFeature: async (featureData) => {
    try {
      const response = await api.post("/feature/add-feature", featureData);
      return { 
        data: response.data.data.feature, 
        error: null,
        success: response.data.message || "Feature added successfully" 
      };
    } catch (error) {
      return {
        data: null, 
        error: error.response?.data?.error || "Failed to add the feature" 
      };
    }
  },

  updateFeature: async (id, featureData) => {
    try {
      const response = await api.put(`/feature/update-feature/${id}`, featureData);
      return { data: response.data.data.feature, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to update the feature" 
      };
    }
  },

  deleteFeature: async (id) => {
    try {
      const response = await api.delete(`/feature/delete-feature/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to delete the feature" 
      };
    }
  },

  searchFeature: async (searchTerm) => {
    try {
      const response = await api.get('/feature/search', { params: { q: searchTerm } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to search features." 
      };
    }
  }
};