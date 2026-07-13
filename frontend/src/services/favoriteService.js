import API from './api';

export const favoriteService = {
  addFavorite: async (propertyId) => {
    const response = await API.post(`/api/favorites/${propertyId}`);
    return response.data;
  },

  removeFavorite: async (propertyId) => {
    const response = await API.delete(`/api/favorites/${propertyId}`);
    return response.data;
  },

  getFavorites: async () => {
    const response = await API.get('/api/favorites');
    return response.data;
  },

  isFavorite: async (propertyId) => {
    const response = await API.get(`/api/favorites/${propertyId}/status`);
    return response.data;
  }
};

export default favoriteService;
