import React, { useEffect, useState } from "react";
import { bookService, getBookCoverUrl, DEFAULT_BOOK_COVER } from "../../services/bookService";
import { authorService } from "../../services/authorService";
import { categoryService } from "../../services/categoryService";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import {
  PlusIcon,
  SearchIcon,
  Edit3Icon,
  Trash2Icon,
  XIcon
} from "../../components/Icons";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    authorId: "",
    categoryId: "",
    publisherId: "",
    isbn: "",
    publicationYear: "",
    totalCopies: 1,
    shelf: "",
    description: "",
    featured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal states
  const [deleteBook, setDeleteBook] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { addToast } = useToast();

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [booksData, authorsData, categoriesData] = await Promise.all([
        bookService.getAll(),
        authorService.getAll(),
        categoryService.getAll(),
      ]);
      setBooks(booksData);
      setAuthors(authorsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load catalog data", err);
      addToast("Failed to load books catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      authorId: authors[0]?.id || "",
      categoryId: categories[0]?.id || "",
      publisherId: "",
      isbn: "",
      publicationYear: new Date().getFullYear().toString(),
      totalCopies: 1,
      availableCopies: 1,
      shelf: "",
      description: "",
      featured: false,
    });
    setImageFile(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    const total = Math.max(book.totalCopies ?? 1, 1);
    const available = Math.min(book.availableCopies ?? total, total);
    setFormData({
      title: book.title || "",
      authorId: book.authorId || book.author?.id || "",
      categoryId: book.categoryId || book.category?.id || "",
      publisherId: book.publisherId || book.publisher?.id || "",
      isbn: book.isbn || "",
      publicationYear: book.publicationYear?.toString() || "",
      totalCopies: total,
      availableCopies: available,
      shelf: book.shelf || "",
      description: book.description || "",
      featured: book.featured || false,
    });
    setImageFile(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("authorId", formData.authorId);
      data.append("categoryId", formData.categoryId);
      if (formData.publisherId) data.append("publisherId", formData.publisherId);
      if (formData.isbn) data.append("isbn", formData.isbn);
      if (formData.publicationYear) data.append("publicationYear", formData.publicationYear);
      data.append("totalCopies", formData.totalCopies);
      if (formData.availableCopies !== undefined && formData.availableCopies !== null) {
        data.append("availableCopies", formData.availableCopies);
      }
      if (formData.shelf) data.append("shelf", formData.shelf);
      if (formData.description) data.append("description", formData.description);
      data.append("featured", formData.featured);
      if (imageFile) data.append("image", imageFile);

      if (editingBook) {
        await bookService.update(editingBook.id, data);
        addToast(`Book "${formData.title}" updated successfully!`, "success");
      } else {
        await bookService.create(data);
        addToast(`New book "${formData.title}" created!`, "success");
      }

      setIsFormModalOpen(false);
      await loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save book record";
      addToast(msg, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBook) return;
    try {
      await bookService.delete(deleteBook.id);
      addToast(`Book "${deleteBook.title}" deleted from catalog.`, "info");
      setIsDeleteModalOpen(false);
      setDeleteBook(null);
      await loadAllData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete book";
      addToast(msg, "error");
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchQuery =
      !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.authorName && b.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = !selectedCategory || b.categoryId === selectedCategory;
    return matchQuery && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Catalog Management</h1>
          <p className="text-slate-300 text-sm mt-1">Manage physical book copies, shelf locations, and book metadata.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" /> Add New Book
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-200 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading catalog records...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No books found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">ISBN</th>
                  <th className="px-6 py-4">Shelf Location</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBooks.map((book) => {
                  const isAvailable = Math.min(book.availableCopies ?? 0, book.totalCopies ?? 0) > 0;
                  const coverImg = getBookCoverUrl(book.image, book.title);

                  return (
                    <tr key={book.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 bg-slate-950 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-slate-800">
                            <img
                              src={coverImg}
                              alt={book.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_BOOK_COVER;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate max-w-xs">{book.title}</span>
                            <span className="text-xs text-slate-400 truncate block">
                              {book.authorName || book.author?.name || "Unknown Author"}
                            </span>
                            {book.featured && (
                              <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-300">
                        {book.categoryName || book.category?.name || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{book.isbn || "-"}</td>
                      <td className="px-6 py-4 text-xs text-slate-300 font-medium">{book.shelf || "-"}</td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{Math.min(book.availableCopies ?? 0, book.totalCopies ?? 0)}</span>
                          <span className="text-slate-400">/ {book.totalCopies}</span>
                          <span className="text-[10px] text-slate-500 font-medium">avail</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isAvailable
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {isAvailable ? "Available" : "Checked Out"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(book)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                            title="Edit Book"
                          >
                            <Edit3Icon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteBook(book);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Delete Book"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Book Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingBook ? "Edit Book Details" : "Add New Book to Catalog"}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Introduction to Algorithms"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Author *
                  </label>
                  <select
                    required
                    value={formData.authorId}
                    onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs text-white bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Author</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs text-white bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="e.g. 978-0132350884"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                    placeholder="e.g. 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalCopies}
                    onChange={(e) => {
                      const newTotal = parseInt(e.target.value) || 1;
                      const activeBorrows = editingBook
                        ? Math.max(0, (editingBook.totalCopies || 0) - (editingBook.availableCopies || 0))
                        : 0;
                      setFormData({
                        ...formData,
                        totalCopies: newTotal,
                        availableCopies: Math.max(0, newTotal - activeBorrows),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {editingBook && (
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      Currently borrowed:{" "}
                      <span className="font-semibold text-amber-400">
                        {Math.max(0, (editingBook.totalCopies || 0) - (editingBook.availableCopies || 0))}
                      </span>{" "}
                      | Projected available:{" "}
                      <span className="font-semibold text-emerald-400">
                        {Math.max(0, formData.totalCopies - Math.max(0, (editingBook.totalCopies || 0) - (editingBook.availableCopies || 0)))}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    value={formData.shelf}
                    onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                    placeholder="e.g. Row 3, Shelf B"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Cover Image Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Description / Synopsis
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of the content..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-950 focus:ring-indigo-500"
                  />
                  <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Highlight as Featured Selection on Home Page
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {formSubmitting ? "Saving..." : editingBook ? "Save Changes" : "Create Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Book Record"
        message={`Are you sure you want to permanently delete "${deleteBook?.title}" from the catalog? This cannot be undone.`}
        confirmText="Delete Book"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteBook(null);
        }}
      />
    </div>
  );
}
