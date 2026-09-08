import api from "./api";

export const fineService = {
  getMyFines: async () => {
    const res = await api.get("/fines/my-fines");
    return res.data;
  },

  getAll: async () => {
    const res = await api.get("/fines/admin/all");
    return res.data;
  },

  getUnpaid: async () => {
    const res = await api.get("/fines/admin/unpaid");
    return res.data;
  },

  pay: async (fineId) => {
    const res = await api.put(`/fines/${fineId}/pay`);
    return res.data;
  },

  waive: async (fineId) => {
    const res = await api.put(`/fines/${fineId}/waive`);
    return res.data;
  },

  generateDemoFine: async () => {
    const res = await api.post("/fines/generate-demo");
    return res.data;
  },

  generateAdminDemoFines: async () => {
    const res = await api.post("/fines/admin/generate-demo");
    return res.data;
  },
};

export const reservationService = {
  joinWaitlist: async (bookId) => {
    const res = await api.post(`/reservations/join?bookId=${bookId}`);
    return res.data;
  },

  cancel: async (reservationId) => {
    const res = await api.delete(`/reservations/${reservationId}/cancel`);
    return res.data;
  },

  getMyReservations: async () => {
    const res = await api.get("/reservations/my-reservations");
    return res.data;
  },

  getAll: async () => {
    const res = await api.get("/reservations/admin/all");
    return res.data;
  },
};

export const favoriteService = {
  toggle: async (bookId) => {
    const res = await api.post(`/favorites/toggle/${bookId}`);
    return res.data;
  },

  check: async (bookId) => {
    const res = await api.get(`/favorites/check/${bookId}`);
    return res.data;
  },

  getMyFavorites: async () => {
    const res = await api.get("/favorites/my-favorites");
    return res.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data;
  },

  markRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await api.put("/notifications/read-all");
    return res.data;
  },
};

export const reportService = {
  getDashboardStats: async () => {
    const res = await api.get("/reports/dashboard");
    return res.data;
  },

  exportBooksCsvUrl: () => `${api.defaults.baseURL}/reports/export/books`,
  exportBorrowsCsvUrl: () => `${api.defaults.baseURL}/reports/export/borrows`,
  exportPaymentsCsvUrl: () => `${api.defaults.baseURL}/reports/export/payments`,
};

export const userService = {
  getAll: async () => {
    const res = await api.get("/users");
    return res.data;
  },

  getDetails: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  toggleStatus: async (id) => {
    const res = await api.put(`/users/${id}/toggle-status`);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export const settingService = {
  getSettings: async () => {
    const res = await api.get("/settings");
    return res.data;
  },

  updateSettings: async (settings) => {
    const res = await api.put("/settings", settings);
    return res.data;
  },
};

export const activityLogService = {
  getLogs: async (page = 0, size = 20) => {
    const res = await api.get(`/activity-logs?page=${page}&size=${size}`);
    return res.data;
  },

  getRecent: async () => {
    const res = await api.get("/activity-logs/recent");
    return res.data;
  },
};
