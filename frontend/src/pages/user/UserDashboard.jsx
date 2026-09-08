import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { borrowService } from "../../services/borrowService";
import { bookService, getBookCoverUrl, DEFAULT_BOOK_COVER } from "../../services/bookService";
import { fineService, reservationService } from "../../services/fineService";
import {
  BookOpenIcon,
  ClockIcon,
  CoinsIcon,
  BookmarkIcon,
  ArrowLeftRightIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from "../../components/Icons";

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [fines, setFines] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [active, myReqs, myRes, myFines, books] = await Promise.all([
          borrowService.getMyActive(),
          borrowService.getMyRequests(),
          reservationService.getMyReservations(),
          fineService.getMyFines(),
          bookService.getFeatured(),
        ]);
        setActiveBorrows(active);
        setRequests(myReqs);
        setReservations(myRes);
        setFines(myFines);
        setFeaturedBooks(books.slice(0, 4));
      } catch (err) {
        console.error("Error loading user dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse h-40"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-28"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalBorrowed = requests.filter((r) => r.status === "RETURNED" || r.status === "BORROWED").length;
  const pendingRequests = requests.filter((r) => r.status === "PENDING").length;
  const unpaidFinesTotal = fines
    .filter((f) => f.status === "UNPAID")
    .reduce((sum, f) => sum + (f.fineAmount || 0), 0);

  const today = new Date();
  const overdueCount = activeBorrows.filter((b) => b.dueDate && new Date(b.dueDate) < today).length;
  const dueSoonCount = activeBorrows.filter((b) => {
    if (!b.dueDate) return false;
    const due = new Date(b.dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/20 dark:border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-200 bg-white/10 px-3 py-1 rounded-full">
            Reader Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            Welcome back, {user?.name || "Reader"}! 👋
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Track your borrowed reading materials, active requests, and explore new literature additions today.
          </p>
        </div>
        <Link
          to="/user/books"
          className="px-6 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm rounded-2xl shadow-sm transition whitespace-nowrap"
        >
          Browse Catalog &rarr;
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="theme-card p-5 rounded-2xl border theme-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpenIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold theme-text-secondary uppercase">Currently Borrowed</p>
            <h3 className="text-2xl font-black theme-text-primary mt-0.5">{activeBorrows.length}</h3>
          </div>
        </div>

        <div className="theme-card p-5 rounded-2xl border theme-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold theme-text-secondary uppercase">Due Soon (&le;3 days)</p>
            <h3 className="text-2xl font-black theme-text-primary mt-0.5">{dueSoonCount}</h3>
          </div>
        </div>

        <div className="theme-card p-5 rounded-2xl border theme-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold theme-text-secondary uppercase">Overdue Items</p>
            <h3 className="text-2xl font-black theme-text-primary mt-0.5">{overdueCount}</h3>
          </div>
        </div>

        <Link
          to="/user/fines"
          className="theme-card p-5 rounded-2xl border theme-border shadow-sm flex items-center gap-4 hover:border-indigo-500/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CoinsIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold theme-text-secondary uppercase">Outstanding Fine</p>
              {unpaidFinesTotal > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded">
                  Pay Now &rarr;
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black theme-text-primary mt-0.5">₹{unpaidFinesTotal.toFixed(0)}</h3>
          </div>
        </Link>
      </div>

      {/* Unpaid Fine Notification Banner */}
      {unpaidFinesTotal > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
              <CoinsIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold theme-text-primary">
                Overdue fine outstanding: ₹{unpaidFinesTotal.toFixed(0)}
              </h4>
              <p className="text-xs theme-text-secondary">
                You have overdue fines on returned or active books. Clear dues online instantly with our simulated checkout portal.
              </p>
            </div>
          </div>
          <Link
            to="/user/fines"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-indigo-600/20 transition shrink-0"
          >
            Settle Fines Online &rarr;
          </Link>
        </div>
      )}

      {/* Secondary Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="theme-card p-4 rounded-2xl border theme-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRightIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium theme-text-primary">Pending Requests</span>
          </div>
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-full">
            {pendingRequests}
          </span>
        </div>

        <div className="theme-card p-4 rounded-2xl border theme-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookmarkIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium theme-text-primary">Active Waitlists</span>
          </div>
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-full">
            {reservations.filter((r) => r.status === "ACTIVE" || r.status === "NOTIFIED").length}
          </span>
        </div>

        <div className="theme-card p-4 rounded-2xl border theme-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium theme-text-primary">Total Books Read</span>
          </div>
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-full">
            {totalBorrowed}
          </span>
        </div>
      </div>

      {/* Currently Borrowed Section */}
      <div className="theme-card rounded-3xl border theme-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold theme-text-primary">Books in Your Possession</h2>
          <Link to="/user/my-books" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Borrows &rarr;
          </Link>
        </div>

        {activeBorrows.length === 0 ? (
          <div className="text-center py-8 theme-text-secondary">
            <BookOpenIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">You don't have any borrowed books right now.</p>
            <Link to="/user/books" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
              Explore catalog to borrow
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBorrows.map((b) => {
              const due = b.dueDate ? new Date(b.dueDate) : null;
              const isOverdue = due && due < today;
              const daysLeft = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <div key={b.id} className="flex gap-4 p-4 rounded-2xl border theme-border theme-card-subtle">
                  <div className="w-16 h-20 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={getBookCoverUrl(b.bookCover, b.bookTitle)}
                      alt={b.bookTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_BOOK_COVER;
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm theme-text-primary">{b.bookTitle}</h4>
                      <p className="text-xs theme-text-secondary mt-0.5">Borrowed on: {b.issueDate || b.requestDate}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isOverdue
                            ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"
                            : daysLeft <= 3
                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                      </span>
                      <Link to="/user/my-books" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Return Book
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured Recommendations */}
      <div className="theme-card rounded-3xl border theme-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold theme-text-primary">Featured in Library</h2>
          <Link to="/user/books" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Explore All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredBooks.map((book) => (
            <Link
              key={book.id}
              to={`/user/books/${book.id}`}
              className="p-3.5 rounded-2xl border theme-border theme-card-subtle hover:theme-card hover:border-indigo-500/50 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                  <img
                    src={getBookCoverUrl(book.image, book.title)}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_BOOK_COVER;
                    }}
                  />
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${book.availableCopies > 0 ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300" : "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300"}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} in stock` : "Waitlist"}
                  </span>
                </div>
                <h4 className="font-bold text-sm theme-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">{book.title}</h4>
                <p className="text-xs theme-text-secondary mt-0.5 truncate">{book.authorName || "Unknown"}</p>
              </div>
              <span className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 block text-right">View details &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
