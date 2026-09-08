import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { bookService, getBookCoverUrl, DEFAULT_BOOK_COVER } from "../../services/bookService";
import { borrowService } from "../../services/borrowService";
import { reservationService, favoriteService } from "../../services/fineService";
import { useToast } from "../../components/Toast";
import {
  BookOpenIcon,
  HeartIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from "../../components/Icons";

export default function UserBookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [borrowNotes, setBorrowNotes] = useState("");

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      try {
        const [bookData, favData] = await Promise.all([
          bookService.getById(id),
          favoriteService.check(id).catch(() => ({ favorite: false })),
        ]);
        setBook(bookData);
        setIsFavorite(favData.favorite);
      } catch (err) {
        console.error("Failed to load book details", err);
        addToast("Failed to load book details", "error");
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id, addToast]);

  const handleFavoriteToggle = async () => {
    try {
      const res = await favoriteService.toggle(id);
      setIsFavorite(res.favorite);
      addToast(res.message, "success");
    } catch (err) {
      addToast("Failed to update favorite status", "error");
    }
  };

  const handleBorrow = async () => {
    setActionLoading(true);
    try {
      await borrowService.requestBorrow(id, borrowNotes);
      addToast(`Borrow request for "${book.title}" submitted!`, "success");
      navigate("/user/borrow-requests");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit borrow request";
      addToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    setActionLoading(true);
    try {
      await reservationService.joinWaitlist(id);
      addToast(`Joined waitlist for "${book.title}"!`, "success");
      navigate("/user/reservations");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to join waitlist";
      addToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Book Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">The requested book could not be located in our catalog.</p>
        <Link to="/user/books" className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl">
          Back to Browse
        </Link>
      </div>
    );
  }

  const isAvailable = Math.min(book.availableCopies ?? 0, book.totalCopies ?? 0) > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link to="/user/books" className="text-xs font-semibold text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1">
          &larr; Back to Catalog
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cover Column */}
          <div className="space-y-4">
            <div className="h-80 sm:h-96 bg-slate-100 rounded-2xl overflow-hidden relative shadow-md flex items-center justify-center">
              {book.image ? (
                <img
                  src={getBookCoverUrl(book.image)}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_BOOK_COVER;
                  }}
                />
              ) : (
                <div className="text-slate-400 text-center p-4">
                  <BookOpenIcon className="w-16 h-16 mx-auto text-slate-300 mb-2" />
                  <span className="text-xs font-semibold">No Image Available</span>
                </div>
              )}
              <button
                onClick={handleFavoriteToggle}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-rose-500 hover:scale-110 transition"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <HeartIcon className="w-5 h-5" filled={isFavorite} />
              </button>
            </div>

            {/* Inventory Badge */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isAvailable
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}>
              {isAvailable ? (
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangleIcon className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {isAvailable ? "Available in Library" : "Currently Checked Out"}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {Math.min(book.availableCopies ?? 0, book.totalCopies ?? 0)} of {book.totalCopies} copies in stock
                </p>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md">
                  {book.categoryName || book.category?.name || "General"}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                  {book.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Authored by <span className="font-semibold text-slate-900">{book.authorName || book.author?.name || "Unknown"}</span>
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">ISBN</span>
                  <span className="font-bold text-slate-800">{book.isbn || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Publisher</span>
                  <span className="font-bold text-slate-800">{book.publisherName || book.publisher?.name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Published Year</span>
                  <span className="font-bold text-slate-800">{book.publicationYear || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Shelf Location</span>
                  <span className="font-bold text-slate-800">{book.shelf || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Default Period</span>
                  <span className="font-bold text-slate-800">14 Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-semibold">Fine Rate</span>
                  <span className="font-bold text-slate-800">₹10 / day</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Book Synopsis</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {book.description || "No synopsis available for this title."}
                </p>
              </div>
            </div>

            {/* Action Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              {isAvailable ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Notes for Administrator (Optional)
                    </label>
                    <input
                      type="text"
                      value={borrowNotes}
                      onChange={(e) => setBorrowNotes(e.target.value)}
                      placeholder="e.g. For academic research project"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <button
                    onClick={handleBorrow}
                    disabled={actionLoading}
                    className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? "Submitting..." : "Submit Borrow Request"}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    All physical copies of this book are currently on loan to other members. You can join the automated waitlist to be notified first as soon as a copy is returned!
                  </p>
                  <button
                    onClick={handleJoinWaitlist}
                    disabled={actionLoading}
                    className="w-full py-3 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? "Joining..." : "Join Waitlist"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
