import API from './api';

const paymentService = {
  createOrder: async (propertyId, paymentType) => {
    const response = await API.post('/api/payments/create-order', { propertyId, paymentType });
    return response.data;
  },

  verifyPayment: async (verificationData) => {
    const response = await API.post('/api/payments/verify', verificationData);
    return response.data;
  },

  getAgentBookings: async () => {
    const response = await API.get('/api/payments/agent-bookings');
    return response.data;
  },

  getMyBookings: async () => {
    const response = await API.get('/api/payments/my-bookings');
    return response.data;
  }
};

export default paymentService;
