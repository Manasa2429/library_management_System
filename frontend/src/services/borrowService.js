import api from "./api";
import { getBookCoverUrl } from "./bookService";

const formatBorrow = (b) => {
  if (!b) return b;
  return {
    ...b,
    bookCover: getBookCoverUrl(b.bookCover, b.bookTitle),
  };
};

export const borrowService = {
  requestBorrow: async (bookId, notes = "") => {
    const res = await api.post("/borrow/request", { bookId, notes });
    return formatBorrow(res.data);
  },

  returnBook: async (borrowId) => {
    const res = await api.put(`/borrow/${borrowId}/return`);
    return formatBorrow(res.data);
  },

  getMyRequests: async () => {
    const res = await api.get("/borrow/my-requests");
    return Array.isArray(res.data) ? res.data.map(formatBorrow) : [];
  },

  getMyActive: async () => {
    const res = await api.get("/borrow/my-active");
    return Array.isArray(res.data) ? res.data.map(formatBorrow) : [];
  },

  getMyHistory: async () => {
    const res = await api.get("/borrow/my-history");
    return Array.isArray(res.data) ? res.data.map(formatBorrow) : [];
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
