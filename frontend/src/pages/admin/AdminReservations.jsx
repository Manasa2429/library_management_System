import React, { useEffect, useState } from "react";
import { reservationService } from "../../services/fineService";
import { useToast } from "../../components/Toast";
import { BookmarkIcon } from "../../components/Icons";

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const { addToast } = useToast();

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load waitlists", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const filtered = reservations.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Waitlist Reservations</h1>
          <p className="text-slate-300 text-sm mt-1">FIFO automated queue for high-demand out-of-stock titles.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-200 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Queueing (Active)</option>
            <option value="NOTIFIED">Notified (Ready to borrow)</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 animate-pulse h-16"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
          <BookmarkIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Waitlists</h3>
          <p className="text-xs text-slate-400 mt-1">No reservations match the selected filter.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Member Name</th>
                  <th className="px-6 py-4">Reserved Date</th>
                  <th className="px-6 py-4">Queue Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-bold text-white">{r.bookTitle}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-200">{r.userName || r.userId}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">{r.reservationDate}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        r.status === "ACTIVE"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : r.status === "NOTIFIED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : r.status === "FULFILLED"
                          ? "bg-slate-800 text-slate-300 border border-slate-700"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
