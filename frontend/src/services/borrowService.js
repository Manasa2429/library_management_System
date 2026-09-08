import api from "./api";

export const borrowService = {
  requestBorrow: async (bookId, notes = "") => {
    const res = await api.post("/borrow/request", { bookId, notes });
    return res.data;
  },

  returnBook: async (borrowId) => {
    const res = await api.put(`/borrow/${borrowId}/return`);
    return res.data;
  },

  getMyRequests: async () => {
    const res = await api.get("/borrow/my-requests");
    return res.data;
  },

  getMyActive: async () => {
    const res = await api.get("/borrow/my-active");
    return res.data;
  },

  getMyHistory: async () => {
    const res = await api.get("/borrow/my-history");
    return res.data;
  },

  // Admin methods
  getAdminPending: async () => {
    const res = await api.get("/borrow/admin/pending");
    return res.data;
  },

  getAdminActive: async () => {
    const res = await api.get("/borrow/admin/active");
    return res.data;
  },

  getAdminOverdue: async () => {
    const res = await api.get("/borrow/admin/overdue");
    return res.data;
  },

  getAdminAll: async () => {
    const res = await api.get("/borrow/admin/all");
    return res.data;
  },

  approve: async (borrowId) => {
    const res = await api.put(`/borrow/${borrowId}/approve`);
    return res.data;
  },

  reject: async (borrowId, reason = "") => {
    const res = await api.put(`/borrow/${borrowId}/reject?reason=${encodeURIComponent(reason)}`);
    return res.data;
  },
};
