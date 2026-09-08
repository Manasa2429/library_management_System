import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookService, getBookCoverUrl, DEFAULT_BOOK_COVER } from "../../services/bookService";
import { categoryService } from "../../services/categoryService";
import { borrowService } from "../../services/borrowService";
import { reservationService, favoriteService } from "../../services/fineService";
import { useToast } from "../../components/Toast";
import { BookOpenIcon, SearchIcon, FilterIcon, HeartIcon } from "../../components/Icons";

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [booksData, catsData, favsData] = await Promise.all([
          bookService.getAll(),
          categoryService.getAll(),
          favoriteService.getMyFavorites().catch(() => []),
        ]);
        setBooks(booksData);
        setCategories(catsData);
        setFavorites(new Set(favsData.map((f) => f.id)));
      } catch (err) {
        console.error("Error loading browse books", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFavoriteToggle = async (bookId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await favoriteService.toggle(bookId);
      const newFavs = new Set(favorites);
      if (res.favorite) {
        newFavs.add(bookId);
        addToast("Added to your favorites!", "success");
      } else {
        newFavs.delete(bookId);
        addToast("Removed from favorites", "info");
      }
      setFavorites(newFavs);
    } catch (err) {
      addToast("Failed to update favorite status", "error");
    }
  };

  const handleBorrow = async (bookId, title) => {
    setActionLoading(bookId);
    try {
      await borrowService.requestBorrow(bookId, "Submitted via catalog browser");
      addToast(`Borrow request for "${title}" submitted! Awaiting admin approval.`, "success");
      navigate("/user/borrow-requests");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit borrow request";
      addToast(msg, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoinWaitlist = async (bookId, title) => {
    setActionLoading(bookId);
    try {
      await reservationService.joinWaitlist(bookId);
      addToast(`You joined the waitlist for "${title}"! We'll notify you when a copy is returned.`, "success");
      navigate("/user/reservations");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to join waitlist";
      addToast(msg, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBooks = books
    .filter((b) => {
      const matchQuery =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.authorName && b.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.categoryName && b.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.isbn && b.isbn.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = !selectedCategory || b.categoryId === selectedCategory;

      const matchAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && b.availableCopies > 0) ||
        (availabilityFilter === "unavailable" && b.availableCopies <= 0);

      return matchQuery && matchCategory && matchAvailability;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "year") return (b.publicationYear || 0) - (a.publicationYear || 0);
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Browse Library Books</h1>
          <p className="text-slate-500 text-sm mt-1">Discover, borrow, or reserve reading selections from the catalog.</p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, category, or ISBN..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <FilterIcon className="w-4 h-4" /> Filter:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Copies</option>
              <option value="unavailable">Waitlist / Out of Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="newest">Recently Added</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="year">Publication Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-80"></div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <BookOpenIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Books Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try changing your search term or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const isFav = favorites.has(book.id);
            const isAvailable = book.availableCopies > 0;
            const isLoading = actionLoading === book.id;

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="h-56 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={getBookCoverUrl(book.image, book.title)}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_BOOK_COVER;
                      }}
                    />

                    {/* Stock status badge */}
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                        isAvailable
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isAvailable ? `${book.availableCopies} in stock` : "Unavailable"}
                    </span>

                    {/* Favorite Heart button */}
                    <button
                      type="button"
                      onClick={(e) => handleFavoriteToggle(book.id, e)}
                      className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 shadow-sm hover:scale-110 transition"
                      title={isFav ? "Remove favorite" : "Add to favorites"}
                    >
                      <HeartIcon className="w-4 h-4" filled={isFav} />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider truncate">
                        {book.categoryName || book.category?.name || "General"}
                      </span>
                      {book.shelf && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          Shelf {book.shelf}
                        </span>
                      )}
                    </div>
                    <Link to={`/user/books/${book.id}`}>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      By {book.authorName || book.author?.name || "Unknown Author"}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {book.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <div className="flex gap-2">
                    {isAvailable ? (
                      <button
                        onClick={() => handleBorrow(book.id, book.title)}
                        disabled={isLoading}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100 transition disabled:opacity-50"
                      >
                        {isLoading ? "Requesting..." : "Borrow"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinWaitlist(book.id, book.title)}
                        disabled={isLoading}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-100 transition disabled:opacity-50"
                      >
                        {isLoading ? "Joining..." : "Join Waitlist"}
                      </button>
                    )}
                    <Link
                      to={`/user/books/${book.id}`}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
