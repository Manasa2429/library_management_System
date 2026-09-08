import api from "./api";

export const SAMPLE_CATEGORIES = [
  { id: "cs", name: "Computer Science", description: "Software architecture, algorithms, and computing systems" },
  { id: "fiction", name: "Classic Fiction", description: "Timeless narrative literature and dystopian masterpieces" },
  { id: "history", name: "History & Anthropology", description: "World civilization, anthropology, and human origins" },
  { id: "psychology", name: "Psychology & Self-Help", description: "Cognitive habits, mental models, and personal growth" },
  { id: "productivity", name: "Productivity & Research", description: "Deep focus methodologies, study habits, and academia" },
  { id: "philosophy", name: "Philosophy & Ethics", description: "Moral reasoning, existential enquiry, and stoicism" }
];

export const categoryService = {
  getAll: async () => {
    try {
      const res = await api.get("/categories");
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      return SAMPLE_CATEGORIES;
    } catch (e) {
      return SAMPLE_CATEGORIES;
    }
  },

  getAllWithCounts: async () => {
    try {
      const res = await api.get("/categories/with-counts");
      return res.data;
    } catch (e) {
      return SAMPLE_CATEGORIES.map(c => ({ ...c, bookCount: 12 }));
    }
  },

  getById: async (id) => {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post("/categories", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};
