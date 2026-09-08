import api from "./api";

export const paymentService = {
  // User endpoints
  initiatePayment: async (fineId, data = { paymentMethod: "UPI" }) => {
    const res = await api.post(`/payments/initiate/${fineId}`, data);
    return res.data;
  },

  processPayment: async (paymentId, data = { simulateOutcome: "SUCCESS" }) => {
    const res = await api.post(`/payments/${paymentId}/process`, data);
    return res.data;
  },

  cancelPayment: async (paymentId) => {
    const res = await api.post(`/payments/${paymentId}/cancel`);
    return res.data;
  },

  getMyPayments: async () => {
    const res = await api.get("/payments/my");
    return res.data;
  },

  getPaymentById: async (paymentId) => {
    const res = await api.get(`/payments/${paymentId}`);
    return res.data;
  },

  getPaymentsByFine: async (fineId) => {
    const res = await api.get(`/payments/fines/${fineId}`);
    return res.data;
  },

  // Admin endpoints
  getAllPayments: async () => {
    const res = await api.get("/payments/admin/all");
    return res.data;
  },

  getPaymentStats: async () => {
    const res = await api.get("/payments/admin/stats");
    return res.data;
  },
};
