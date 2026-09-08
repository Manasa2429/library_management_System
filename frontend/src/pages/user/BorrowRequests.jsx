import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { borrowService } from "../../services/borrowService";
import { ArrowLeftRightIcon } from "../../components/Icons";

export default function BorrowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await borrowService.getMyRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to load requests", err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">Pending Review</span>;
      case "APPROVED":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">Approved</span>;
      case "BORROWED":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">Active Loan</span>;
      case "REJECTED":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">Rejected</span>;
      case "RETURNED":
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">Returned</span>;
      default:
        return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Borrow Requests</h1>
        <p className="text-slate-500 text-sm mt-1">Track the status of your submitted book checkout applications.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-24"></div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <ArrowLeftRightIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Requests Submitted</h3>
          <p className="text-xs text-slate-500 mt-1">You have not submitted any book checkout requests yet.</p>
          <Link
            to="/user/books"
            className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Request Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Notes / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{r.bookTitle}</span>
                      <span className="text-[11px] text-slate-400">ID: {r.id}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {r.requestDate}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {r.status === "REJECTED" && r.rejectionReason ? (
                        <span className="text-rose-600 font-medium">{r.rejectionReason}</span>
                      ) : (
                        <span className="text-slate-500">{r.notes || "Standard checkout"}</span>
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
