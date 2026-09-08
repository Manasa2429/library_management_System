import api from "./api";

export const DEFAULT_BOOK_COVER =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop";

export const BOOK_COVER_MAP = {
  "1984": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
  "clean code": "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?q=80&w=800&auto=format&fit=crop",
  "sapiens": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop",
  "pragmatic": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
  "atomic habits": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
  "designing data": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
  "mockingbird": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800&auto=format&fit=crop",
  "gatsby": "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
  "animal farm": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
  "brave new world": "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=800&auto=format&fit=crop",
  "cosmos": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop",
  "history of time": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  "psychology of money": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
  "thinking, fast": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop",
  "deep work": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
  "zero to one": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
  "algorithms": "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
  "design patterns": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
  "selfish gene": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
  "steve jobs": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
};

export const CURATED_COVERS = [
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
];

export const getBookCoverUrl = (image, title = "") => {
  if (image && typeof image === "string" && image.trim().length > 0) {
    const clean = image.trim();
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
      return clean;
    }
    const apiBase = process.env.REACT_APP_API_URL || "https://library-management-system-zrup.onrender.com/api";
    const backendBase = apiBase.replace(/\/api\/?$/, "");
    return `${backendBase}${clean.startsWith("/") ? "" : "/"}${clean}`;
  }

  // If no image, match by title
  if (title && typeof title === "string") {
    const lower = title.toLowerCase();
    for (const [key, url] of Object.entries(BOOK_COVER_MAP)) {
      if (lower.includes(key)) {
        return url;
      }
    }
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash + title.charCodeAt(i)) % CURATED_COVERS.length;
    }
    return CURATED_COVERS[hash];
  }

  return DEFAULT_BOOK_COVER;
};

export const formatBook = (b) => {
  if (!b) return b;
  return {
    ...b,
    image: getBookCoverUrl(b.image, b.title),
  };
};

export const SAMPLE_BOOKS = [
  {
    id: "sample-1",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    authorName: "Robert C. Martin",
    categoryName: "Computer Science",
    categoryId: "cs",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?q=80&w=800&auto=format&fit=crop",
    availableCopies: 4,
    totalCopies: 5,
    shelf: "CS-04",
    isbn: "978-0132350884",
    publicationYear: 2008,
    featured: true,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. A timeless guide to writing elegant, readable, and maintainable software."
  },
  {
    id: "sample-2",
    title: "1984: The Masterpiece",
    authorName: "George Orwell",
    categoryName: "Classic Fiction",
    categoryId: "fiction",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    availableCopies: 3,
    totalCopies: 4,
    shelf: "FIC-12",
    isbn: "978-0451524935",
    publicationYear: 1949,
    featured: true,
    description: "Winston Smith toes the Party line, rewriting history to satisfy the demands of the Ministry of Truth. An eerie, prophetically powerful warning about surveillance and authoritarian control."
  },
  {
    id: "sample-3",
    title: "Sapiens: A Brief History of Humankind",
    authorName: "Yuval Noah Harari",
    categoryName: "History & Anthropology",
    categoryId: "history",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop",
    availableCopies: 5,
    totalCopies: 6,
    shelf: "HIST-01",
    isbn: "978-0062316097",
    publicationYear: 2014,
    featured: true,
    description: "100,000 years ago, at least six human species inhabited the Earth. Today there is just one: Homo sapiens. How did our species succeed in conquering the world?"
  },
  {
    id: "sample-4",
    title: "The Pragmatic Programmer",
    authorName: "David Thomas & Andrew Hunt",
    categoryName: "Software Engineering",
    categoryId: "cs",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
    availableCopies: 2,
    totalCopies: 3,
    shelf: "CS-08",
    isbn: "978-0135957059",
    publicationYear: 2019,
    featured: true,
    description: "One of the most significant books in computing literature. Covers career development, architectural choices, and practical methodologies for professional software development."
  },
  {
    id: "sample-5",
    title: "Atomic Habits",
    authorName: "James Clear",
    categoryName: "Psychology & Self-Help",
    categoryId: "psychology",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    availableCopies: 0,
    totalCopies: 4,
    shelf: "SELF-03",
    isbn: "978-0735211292",
    publicationYear: 2018,
    featured: false,
    description: "An extraordinarily practical framework for breaking bad routines and building good ones. Small incremental changes lead to remarkable long-term compound results."
  },
  {
    id: "sample-6",
    title: "Designing Data-Intensive Applications",
    authorName: "Martin Kleppmann",
    categoryName: "Computer Science",
    categoryId: "cs",
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop",
    availableCopies: 4,
    totalCopies: 4,
    shelf: "CS-15",
    isbn: "978-1449373320",
    publicationYear: 2017,
    featured: false,
    description: "The definitive guide to distributed databases, consensus algorithms, stream processing architectures, and high-scale reliable data processing."
  },
  {
    id: "sample-7",
    title: "Deep Work: Rules for Focused Success",
    authorName: "Cal Newport",
    categoryName: "Productivity & Research",
    categoryId: "productivity",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
    availableCopies: 1,
    totalCopies: 3,
    shelf: "RES-02",
    isbn: "978-1455586691",
    publicationYear: 2016,
    featured: false,
    description: "Deep work is the ability to focus without distraction on a cognitively demanding task. A rare superpower in our increasingly distracted knowledge economy."
  },
  {
    id: "sample-8",
    title: "To Kill a Mockingbird",
    authorName: "Harper Lee",
    categoryName: "Classic Fiction",
    categoryId: "fiction",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
    availableCopies: 3,
    totalCopies: 5,
    shelf: "FIC-09",
    isbn: "978-0060935467",
    publicationYear: 1960,
    featured: false,
    description: "The unforgettable novel of childhood in a sleepy town and the crisis of conscience that rocked it, exploring morality, empathy, and social justice."
  }
];

export const bookService = {
  getAll: async () => {
    try {
      const res = await api.get("/books");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(formatBook);
      }
      return SAMPLE_BOOKS.map(formatBook);
    } catch (e) {
      return SAMPLE_BOOKS.map(formatBook);
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/books/${id}`);
      return formatBook(res.data);
    } catch (e) {
      const found = SAMPLE_BOOKS.find((b) => b.id === id);
      if (found) return formatBook(found);
      return formatBook(SAMPLE_BOOKS[0]);
    }
  },

  search: async (query) => {
    try {
      const res = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
      if (Array.isArray(res.data)) {
        return res.data.map(formatBook);
      }
      return [];
    } catch (e) {
      const q = query.toLowerCase();
      return SAMPLE_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q) ||
          b.categoryName.toLowerCase().includes(q)
      ).map(formatBook);
    }
  },

  getFeatured: async () => {
    try {
      const res = await api.get("/books/featured");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(formatBook);
      }
      return SAMPLE_BOOKS.filter((b) => b.featured).map(formatBook);
    } catch (e) {
      return SAMPLE_BOOKS.filter((b) => b.featured).map(formatBook);
    }
  },

  getRecent: async () => {
    try {
      const res = await api.get("/books/recent");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(formatBook);
      }
      return SAMPLE_BOOKS.slice(0, 4).map(formatBook);
    } catch (e) {
      return SAMPLE_BOOKS.slice(0, 4).map(formatBook);
    }
  },

  getByCategory: async (categoryId) => {
    try {
      const res = await api.get(`/books/category/${categoryId}`);
      if (Array.isArray(res.data)) {
        return res.data.map(formatBook);
      }
      return [];
    } catch (e) {
      return SAMPLE_BOOKS.filter((b) => b.categoryId === categoryId).map(formatBook);
    }
  },

  create: async (formData) => {
    const res = await api.post("/books", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  update: async (id, formData) => {
    const res = await api.put(`/books/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/books/${id}`);
    return res.data;
  },

  seedSamples: async () => {
    const res = await api.post("/books/seed-samples");
    return res.data;
  },
};

