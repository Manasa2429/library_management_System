import React, { useEffect, useState } from "react";
import { paymentService } from "../../services/paymentService";
import { useToast } from "../../components/Toast";
import {
  CreditCardIcon,
  ReceiptIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  SearchIcon,
  DownloadIcon,
  XIcon
} from "../../components/Icons";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [listData, statsData] = await Promise.all([
        paymentService.getAllPayments(),
        paymentService.getPaymentStats(),
      ]);
      setPayments(listData || []);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      addToast("Failed to load payment transactions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.userName?.toLowerCase().includes(q) ||
      p.userEmail?.toLowerCase().includes(q) ||
      p.bookTitle?.toLowerCase().includes(q);
    return matchesStatus && matchesMethod && matchesSearch;
  });

  const totalCollected = stats?.totalCollected ?? payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successCount = stats?.successfulCount ?? payments.filter((p) => p.status === "SUCCESS").length;
  const failedCount = stats?.failedCount ?? payments.filter((p) => p.status === "FAILED").length;
  const pendingCount = stats?.pendingCount ?? payments.filter((p) => p.status === "INITIATED" || p.status === "PROCESSING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Online Payment Ledger</h1>
          <p className="text-slate-300 text-sm mt-1">
            Audit simulated fine payments, monitor transaction settlements, and review revenue intake.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`${process.env.REACT_APP_API_URL || "http://localhost:8081/api"}/reports/export/payments`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <DownloadIcon className="w-4 h-4" />
            Export Payments CSV
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Total Online Collected
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
              ₹{totalCollected.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">From {successCount} transactions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
              Successful Payments
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{successCount}</span>
            <span className="text-xs text-slate-400 mt-1 block">Settled penalties</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <CreditCardIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
              Pending / Initiated
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{pendingCount}</span>
            <span className="text-xs text-slate-400 mt-1 block">Open checkout sessions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ReceiptIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">Failed Payments</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">{failedCount}</span>
            <span className="text-xs text-slate-400 mt-1 block">Simulated declines</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangleIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transaction ID, user, email, book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-200 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="INITIATED">Initiated</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-200 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="NET_BANKING">Net Banking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading transaction records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-12 text-center text-slate-400">
          <ReceiptIcon className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No Transactions Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery || statusFilter !== "all" || methodFilter !== "all"
              ? "No transactions match your current filters."
              : "No online payment records exist in the database yet."}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">{p.transactionId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{p.userName}</div>
                      <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-300">{p.bookTitle}</td>
                    <td className="px-6 py-4 font-black text-white">₹{p.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300">
                        {p.paymentMethod?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          p.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : p.status === "FAILED"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {p.status === "SUCCESS" && <CheckCircleIcon className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {p.paidAt
                        ? p.paidAt.replace("T", " ").substring(0, 16)
                        : p.createdAt?.replace("T", " ").substring(0, 16)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <ReceiptIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment Audit Record</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedPayment.transactionId}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400">Transaction Status:</span>
                <span className="font-bold text-emerald-400">{selectedPayment.status}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400">Penalty Amount:</span>
                <span className="font-black text-white text-sm">₹{selectedPayment.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400">Member:</span>
                <span className="font-semibold text-white">
                  {selectedPayment.userName} ({selectedPayment.userEmail})
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400">Book Title:</span>
                <span className="font-semibold text-slate-200">{selectedPayment.bookTitle}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400">Simulated Channel:</span>
                <span className="font-semibold text-slate-200">{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400">Initiated At:</span>
                <span className="text-slate-300">{selectedPayment.createdAt?.replace("T", " ")}</span>
              </div>
              {selectedPayment.paidAt && (
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400">Settled At:</span>
                  <span className="text-slate-300">{selectedPayment.paidAt.replace("T", " ")}</span>
                </div>
              )}
              {selectedPayment.failureReason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <span className="font-bold block mb-1">Failure Reason:</span>
                  {selectedPayment.failureReason}
                </div>
              )}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="font-bold text-slate-400 block mb-1">Gateway Internal Notes:</span>
                <span className="font-mono text-[11px] text-slate-300">
                  {selectedPayment.notes || "Standard mock gateway approval"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
