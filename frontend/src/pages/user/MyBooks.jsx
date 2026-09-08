import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { borrowService } from "../../services/borrowService";
import { getBookCoverUrl, DEFAULT_BOOK_COVER } from "../../services/bookService";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { BookOpenIcon, ClockIcon, AlertTriangleIcon } from "../../components/Icons";

export default function MyBooks() {
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [historyBorrows, setHistoryBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("current");

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [active, history] = await Promise.all([
        borrowService.getMyActive(),
        borrowService.getMyHistory(),
      ]);
      setActiveBorrows(active);
      setHistoryBorrows(history);
    } catch (err) {
      console.error("Failed to load user books", err);
      addToast("Failed to load borrowed books", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReturnModal = (borrow) => {
    setSelectedBorrow(borrow);
    setIsModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedBorrow) return;
    setActionLoading(true);
    try {
      await borrowService.returnBook(selectedBorrow.id);
      addToast(`Book "${selectedBorrow.bookTitle}" returned successfully!`, "success");
      setIsModalOpen(false);
      setSelectedBorrow(null);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to return book";
      addToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Borrowed Books</h1>
        <p className="text-slate-500 text-sm mt-1">Manage active book loans and review your completed reading logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("current")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === "current"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Currently Borrowed ({activeBorrows.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Borrowing History ({historyBorrows.length})
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-40"></div>
          ))}
        </div>
      ) : activeTab === "current" ? (
        activeBorrows.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
            <BookOpenIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Active Borrowed Books</h3>
            <p className="text-xs text-slate-500 mt-1">You currently don't hold any books on loan.</p>
            <Link
              to="/user/books"
              className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
            >
              Browse Books to Borrow
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBorrows.map((b) => {
              const due = b.dueDate ? new Date(b.dueDate) : null;
              const isOverdue = due && due < today;
              const daysLeft = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-28 bg-slate-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isOverdue
                              ? "bg-rose-100 text-rose-700"
                              : daysLeft <= 3
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isOverdue ? "OVERDUE" : `${daysLeft} days remaining`}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 truncate">{b.bookTitle}</h3>
                      <p className="text-xs text-slate-500 mt-1">Issued: {b.issueDate || b.requestDate}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">Due: {b.dueDate || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {isOverdue && (
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangleIcon className="w-4 h-4" /> Fine: ₹10/day applies
                      </span>
                    )}
                    <button
                      onClick={() => openReturnModal(b)}
                      className="ml-auto px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                    >
                      Return This Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : historyBorrows.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <ClockIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Past Records</h3>
          <p className="text-xs text-slate-500 mt-1">Completed book loans and return receipts will show up here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Borrow Date</th>
                  <th className="px-6 py-4">Return Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Fine Incurred</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyBorrows.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{b.bookTitle}</td>
                    <td className="px-6 py-4 text-xs">{b.issueDate || b.requestDate}</td>
                    <td className="px-6 py-4 text-xs">{b.returnDate || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        RETURNED
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      {b.fineAmount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-rose-600">₹{b.fineAmount.toFixed(0)} ({b.fineStatus})</span>
                          {b.fineStatus === "UNPAID" && (
                            <Link
                              to="/user/fines"
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition inline-block"
                            >
                              Pay Now &rarr;
                            </Link>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-600">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="Return Book"
        message={`Are you sure you want to return "${selectedBorrow?.bookTitle}"? This copy will become available for other readers and waitlisted users.`}
        confirmText={actionLoading ? "Returning..." : "Confirm Return"}
        onConfirm={handleConfirmReturn}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedBorrow(null);
        }}
      />
    </div>
  );
}
