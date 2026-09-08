import React, { useEffect, useState } from "react";
import { borrowService } from "../../services/borrowService";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { CheckCircleIcon, ClockIcon, XIcon } from "../../components/Icons";

export default function AdminBorrowing() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingList, setPendingList] = useState([]);
  const [activeList, setActiveList] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [allList, setAllList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectBorrow, setRejectBorrow] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Return modal
  const [returnBorrow, setReturnBorrow] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [pending, active, overdue, all] = await Promise.all([
        borrowService.getAdminPending(),
        borrowService.getAdminActive(),
        borrowService.getAdminOverdue(),
        borrowService.getAdminAll(),
      ]);
      setPendingList(pending);
      setActiveList(active);
      setOverdueList(overdue);
      setAllList(all);
    } catch (err) {
      console.error(err);
      addToast("Failed to load borrowing records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id, title, userName) => {
    try {
      await borrowService.approve(id);
      addToast(`Approved checkout of "${title}" for ${userName}!`, "success");
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to approve borrow request";
      addToast(msg, "error");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectBorrow) return;
    setActionLoading(true);
    try {
      await borrowService.reject(rejectBorrow.id, rejectReason);
      addToast(`Borrow request for "${rejectBorrow.bookTitle}" was rejected.`, "info");
      setIsRejectModalOpen(false);
      setRejectBorrow(null);
      setRejectReason("");
      await loadData();
    } catch (err) {
      addToast("Failed to reject request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnConfirm = async () => {
    if (!returnBorrow) return;
    setActionLoading(true);
    try {
      await borrowService.returnBook(returnBorrow.id);
      addToast(`Marked "${returnBorrow.bookTitle}" as returned! Stock updated & waitlists notified.`, "success");
      setIsReturnModalOpen(false);
      setReturnBorrow(null);
      await loadData();
    } catch (err) {
      addToast("Failed to process book return", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const today = new Date();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-20"></div>
          ))}
        </div>
      );
    }

    if (activeTab === "pending") {
      if (pendingList.length === 0) {
        return (
          <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
            <CheckCircleIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Queue is Clear</h3>
            <p className="text-xs text-slate-400 mt-1">No pending checkout requests requiring review.</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingList.map((item) => (
            <div key={item.id} className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PENDING APPROVAL
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{item.requestDate}</span>
                </div>
                <h3 className="font-bold text-base text-white">{item.bookTitle}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Requested by: <span className="font-semibold text-slate-200">{item.userName}</span> ({item.userEmail})
                </p>
                {item.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-2xl mt-3 border border-slate-800 italic">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setRejectBorrow(item);
                    setIsRejectModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(item.id, item.bookTitle, item.userName)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition"
                >
                  Approve & Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "active") {
      if (activeList.length === 0) {
        return (
          <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
            <ClockIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Active Loans</h3>
            <p className="text-xs text-slate-400 mt-1">All copies are presently in the library shelves.</p>
          </div>
        );
      }
      return (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Book</th>
                  <th className="px-6 py-4">Borrower</th>
                  <th className="px-6 py-4">Issued On</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Loan Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activeList.map((item) => {
                  const due = item.dueDate ? new Date(item.dueDate) : null;
                  const isOverdue = due && due < today;
                  const daysLeft = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-bold text-white">{item.bookTitle}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-semibold text-slate-200 block">{item.userName}</span>
                        <span className="text-slate-400">{item.userEmail}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{item.issueDate}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-200">{item.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isOverdue
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : daysLeft <= 3
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {isOverdue ? `${Math.abs(daysLeft)}d Overdue` : `${daysLeft}d Left`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setReturnBorrow(item);
                            setIsReturnModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition"
                        >
                          Mark Returned
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === "overdue") {
      if (overdueList.length === 0) {
        return (
          <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
            <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Zero Overdue Books</h3>
            <p className="text-xs text-slate-400 mt-1">All borrowed materials are currently within their due dates.</p>
          </div>
        );
      }
      return (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Borrower</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Days Overdue</th>
                  <th className="px-6 py-4">Accumulated Fine</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {overdueList.map((item) => {
                  const due = item.dueDate ? new Date(item.dueDate) : today;
                  const diffDays = Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)));
                  const fine = diffDays * 10;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-bold text-white">{item.bookTitle}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-semibold text-slate-200 block">{item.userName}</span>
                        <span className="text-slate-400">{item.userEmail}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-rose-400 font-bold">{item.dueDate}</td>
                      <td className="px-6 py-4 text-xs font-bold text-rose-400">{diffDays} days</td>
                      <td className="px-6 py-4 text-xs font-black text-rose-400">₹{fine}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setReturnBorrow(item);
                            setIsReturnModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition"
                        >
                          Mark Returned
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Default: all list
    return (
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Book Title</th>
                <th className="px-6 py-4">Borrower</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Request Date</th>
                <th className="px-6 py-4">Return Date</th>
                <th className="px-6 py-4">Fine Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {allList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 font-bold text-white">{item.bookTitle}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="font-semibold text-slate-200 block">{item.userName}</span>
                    <span className="text-slate-400">{item.userEmail}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      item.status === "BORROWED"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : item.status === "RETURNED"
                        ? "bg-slate-800 text-slate-300 border border-slate-700"
                        : item.status === "REJECTED"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">{item.requestDate}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{item.returnDate || "-"}</td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    {item.fineAmount > 0 ? (
                      <span className="text-rose-400 font-bold">₹{item.fineAmount.toFixed(0)} ({item.fineStatus})</span>
                    ) : (
                      <span className="text-slate-400">₹0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Circulation & Borrowing</h1>
        <p className="text-slate-300 text-sm mt-1">Review pending checkout requests, manage active loans, and record returns.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "pending"
              ? "border-indigo-500 text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>Pending Approvals</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            {pendingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "active"
              ? "border-indigo-500 text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>Active Loans</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
            {activeList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "overdue"
              ? "border-indigo-500 text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>Overdue Books</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
            {overdueList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === "all"
              ? "border-indigo-500 text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          All Circulation History ({allList.length})
        </button>
      </div>

      {/* Rendered content */}
      {renderContent()}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Reject Checkout Request</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-white">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-slate-300">
                Please provide a reason for rejecting the request for <span className="font-bold text-white">{rejectBorrow?.bookTitle}</span> by {rejectBorrow?.userName}.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Rejection Reason
                </label>
                <textarea
                  required
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Borrower has reached max loan limit or book under physical repair."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <ConfirmModal
        isOpen={isReturnModalOpen}
        title="Mark Book as Returned"
        message={`Mark "${returnBorrow?.bookTitle}" borrowed by ${returnBorrow?.userName} as returned? Physical copies will be updated in catalog and waitlisted members notified.`}
        confirmText="Confirm Return"
        onConfirm={handleReturnConfirm}
        onCancel={() => {
          setIsReturnModalOpen(false);
          setReturnBorrow(null);
        }}
      />
    </div>
  );
}
