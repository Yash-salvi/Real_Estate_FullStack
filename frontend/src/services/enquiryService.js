import API from './api';

export const enquiryService = {
  createEnquiry: async (propertyId, message) => {
    const response = await API.post('/api/enquiries', { propertyId, message });
    return response.data;
  },

  getMyEnquiries: async () => {
    const response = await API.get('/api/enquiries/my-enquiries');
    return response.data;
  },

  getAgentEnquiries: async () => {
    const response = await API.get('/api/enquiries/agent-enquiries');
    return response.data;
  },

  respondToEnquiry: async (id, status) => {
    const response = await API.put(`/api/enquiries/${id}/respond`, null, {
      params: { status }
    });
    return response.data;
  }
};

export default enquiryService;
