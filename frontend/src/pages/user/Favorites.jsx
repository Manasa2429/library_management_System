import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { favoriteService } from "../../services/fineService";
import { getBookCoverUrl, DEFAULT_BOOK_COVER } from "../../services/bookService";
import { useToast } from "../../components/Toast";
import { HeartIcon, BookOpenIcon } from "../../components/Icons";

export default function Favorites() {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await favoriteService.getMyFavorites();
      setFavoriteBooks(data);
    } catch (err) {
      console.error("Failed to load favorites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (bookId) => {
    try {
      await favoriteService.toggle(bookId);
      addToast("Removed from favorites", "info");
      await loadFavorites();
    } catch (err) {
      addToast("Failed to remove favorite", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Saved Favorites</h1>
        <p className="text-slate-500 text-sm mt-1">Quickly access books you have bookmarked for future reading.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-80"></div>
          ))}
        </div>
      ) : favoriteBooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <HeartIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Favorites Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Tap the heart icon on any book in the catalog to save it here.</p>
          <Link
            to="/user/books"
            className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={getBookCoverUrl(book.image, book.title)}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_BOOK_COVER;
                    }}
                  />
                  <button
                    onClick={() => handleRemove(book.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-rose-500 shadow-sm flex items-center justify-center hover:scale-110 transition"
                    title="Remove from favorites"
                  >
                    <HeartIcon className="w-4 h-4" filled={true} />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition truncate">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{book.authorName || "Unknown"}</p>
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    book.availableCopies > 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} available` : "Checked out"}
                  </span>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to={`/user/books/${book.id}`}
                  className="w-full block text-center py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                >
                  View Book &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
