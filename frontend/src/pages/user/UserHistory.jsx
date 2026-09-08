import React, { useEffect, useState } from "react";
import { borrowService } from "../../services/borrowService";
import { FileTextIcon } from "../../components/Icons";

export default function UserHistory() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [active, completed] = await Promise.all([
          borrowService.getMyActive(),
          borrowService.getMyHistory(),
        ]);
        setHistory([...active, ...completed]);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = history.filter((item) => {
    if (filter === "returned") return item.status === "RETURNED";
    if (filter === "borrowed") return item.status === "BORROWED";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Borrowing History</h1>
          <p className="text-slate-500 text-sm mt-1">Full audit record of all books you have borrowed and returned.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All Records</option>
            <option value="borrowed">Active Loans</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-20"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <FileTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No History Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">Your reading history is clean.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Issued On</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Returned On</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Fine Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.bookTitle}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{item.issueDate || item.requestDate}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{item.dueDate || "-"}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{item.returnDate || "Not returned yet"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        item.status === "BORROWED"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      {item.fineAmount > 0 ? (
                        <span className="text-rose-600">₹{item.fineAmount.toFixed(0)} ({item.fineStatus})</span>
                      ) : (
                        <span className="text-emerald-600">₹0</span>
                      )}
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
