import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reservationService } from "../../services/fineService";
import { useToast } from "../../components/Toast";
import { BookmarkIcon, BellIcon } from "../../components/Icons";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { addToast } = useToast();

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error("Failed to load waitlists", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (id, title) => {
    setActionLoading(id);
    try {
      await reservationService.cancel(id);
      addToast(`Waitlist for "${title}" cancelled`, "info");
      await loadReservations();
    } catch (err) {
      addToast("Failed to cancel waitlist", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">In Waitlist Queue</span>;
      case "NOTIFIED":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">Copy Available!</span>;
      case "FULFILLED":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">Fulfilled</span>;
      case "CANCELLED":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Waitlist Reservations</h1>
        <p className="text-slate-500 text-sm mt-1">
          When books are out of stock, SmartLibrary automatically notifies waitlisted members first upon return.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-24"></div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <BookmarkIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Active Reservations</h3>
          <p className="text-xs text-slate-500 mt-1">You haven't joined any book waitlists.</p>
          <Link
            to="/user/books"
            className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((r) => {
            const isNotified = r.status === "NOTIFIED";
            const isActive = r.status === "ACTIVE";

            return (
              <div
                key={r.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition ${
                  isNotified ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {getStatusBadge(r.status)}
                    <span className="text-xs text-slate-400">Joined: {r.reservationDate}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{r.bookTitle}</h3>

                  {isNotified && (
                    <div className="mt-3 p-3 rounded-2xl bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                      <BellIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>A copy was just returned! You have priority to checkout this title now.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  {isNotified && (
                    <Link
                      to={`/user/books/${r.bookId}`}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                    >
                      Borrow Now
                    </Link>
                  )}
                  {isActive && (
                    <button
                      onClick={() => handleCancel(r.id, r.bookTitle)}
                      disabled={actionLoading === r.id}
                      className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                    >
                      {actionLoading === r.id ? "Cancelling..." : "Leave Waitlist"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
