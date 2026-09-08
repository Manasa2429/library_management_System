import api from "./api";

export const authorService = {
  getAll: async () => {
    const res = await api.get("/authors");
    return res.data;
  },

  getAllWithCounts: async () => {
    const res = await api.get("/authors/with-counts");
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/authors/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/authors", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/authors/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/authors/${id}`);
    return res.data;
  },
};
