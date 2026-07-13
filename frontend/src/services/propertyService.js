import API from './api';

export const propertyService = {
  getProperties: async (params = {}) => {
    const response = await API.get('/api/properties', { params });
    return response.data;
  },

  getProperty: async (id) => {
    const response = await API.get(`/api/properties/${id}`);
    return response.data;
  },

  createProperty: async (propertyData) => {
    const response = await API.post('/api/properties', propertyData);
    return response.data;
  },

  updateProperty: async (id, propertyData) => {
    const response = await API.put(`/api/properties/${id}`, propertyData);
    return response.data;
  },

  deleteProperty: async (id) => {
    const response = await API.delete(`/api/properties/${id}`);
    return response.data;
  },

  getMyListings: async (params = {}) => {
    const response = await API.get('/api/properties/my-listings', { params });
    return response.data;
  },

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post(`/api/properties/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default propertyService;
