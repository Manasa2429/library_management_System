import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookService } from "../../services/bookService";
import { categoryService } from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { BookOpenIcon, SearchIcon, FilterIcon } from "../../components/Icons";

export default function ExploreBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [booksData, catsData] = await Promise.all([
          bookService.getAll().catch(() => []),
          categoryService.getAll().catch(() => []),
        ]);
        setBooks(Array.isArray(booksData) ? booksData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
      } catch (err) {
        console.error("Failed to load catalog", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // filtered in memory below
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

  const handleActionClick = (book) => {
    if (!user) {
      addToast("Please sign in to borrow or reserve books.", "info");
      navigate("/login");
      return;
    }
    navigate(`/user/books/${book.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header Banner */}
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
            Comprehensive Digital Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore Book Catalog
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-xl">
            Discover peer-reviewed literature, academic texts, computer science treatises, and fiction from our global collection.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{filteredBooks.length} of {books.length} Books Matched</span>
        </div>
      </div>

      {/* Modern Search & Filter Panel */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm mb-10 space-y-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 5,000+ titles by book name, author, genre, or ISBN..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition bg-slate-50/50 dark:bg-slate-950/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-md shadow-indigo-600/20 transition whitespace-nowrap"
          >
            Search Catalog
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
              !selectedCategory
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All Genres ({books.length})
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? "" : c.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters & Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FilterIcon className="w-4 h-4 text-slate-400" />
              Availability:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {[
                { key: "all", label: "All Items" },
                { key: "available", label: "Available Now" },
                { key: "unavailable", label: "Waitlist Only" },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setAvailabilityFilter(pill.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    availabilityFilter === pill.key
                      ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="newest">Recently Cataloged</option>
              <option value="title">Alphabetical (A - Z)</option>
              <option value="year">Publication Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse h-96"></div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-14 border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Volumes Matched</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            We could not find any books matching your active search query or filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setAvailabilityFilter("all");
            }}
            className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const isAvailable = (book.availableCopies || 0) > 0;
            return (
              <div
                key={book.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        book.image?.startsWith("http")
                          ? book.image
                          : book.image
                          ? `http://localhost:8081${book.image}`
                          : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop";
                      }}
                    />

                    {/* In-Stock / Availability Pill */}
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm border ${
                        isAvailable
                          ? "bg-emerald-500/90 text-white border-emerald-400/30"
                          : "bg-amber-500/90 text-white border-amber-400/30"
                      }`}
                    >
                      {isAvailable ? `${book.availableCopies} Available` : "Waitlist Only"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                        {book.categoryName || book.category?.name || "General"}
                      </span>
                      {book.shelf && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Shelf {book.shelf}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      By {book.authorName || book.author?.name || "Unknown Author"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {book.description || "No synopsis recorded for this title in the catalog."}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <button
                    onClick={() => handleActionClick(book)}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition duration-200 ${
                      isAvailable
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                        : "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-none"
                    }`}
                  >
                    {isAvailable ? "Borrow Book" : "Join Waitlist"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
