import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import { useToast } from "../../components/Toast";
import {
  CreditCardIcon,
  ReceiptIcon,
  CheckCircleIcon,
  SearchIcon,
  FilterIcon
} from "../../components/Icons";

export default function UserPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { addToast } = useToast();

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getMyPayments();
      setPayments(data || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to load payment history.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.bookTitle?.toLowerCase().includes(q) ||
      p.paymentMethod?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalSuccessfulAmount = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const successfulCount = payments.filter((p) => p.status === "SUCCESS").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black theme-text-primary tracking-tight">Payment History</h1>
          <p className="theme-text-secondary text-sm mt-1">
            Complete transaction ledger for online fine settlements and receipts.
          </p>
        </div>

        <div>
          <Link
            to="/user/fines"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
          >
            <CreditCardIcon className="w-4 h-4" />
            Pay Outstanding Fines
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="theme-card p-6 rounded-3xl border theme-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold theme-text-secondary uppercase tracking-wider block">
              Total Cleared
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              ₹{totalSuccessfulAmount.toFixed(0)}
            </span>
            <span className="text-xs theme-text-secondary mt-1 block">{successfulCount} successful transactions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold theme-text-secondary uppercase tracking-wider block">
              All Transactions
            </span>
            <span className="text-3xl font-black theme-text-primary mt-1 block">{payments.length}</span>
            <span className="text-xs theme-text-secondary mt-1 block">Logged checkout attempts</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <ReceiptIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <span>🛡️</span> Demo System
          </span>
          <p className="text-xs theme-text-secondary mt-2 leading-relaxed">
            All records reflect simulated online transactions. Official receipts can be printed at any time.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by transaction ID, book title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border theme-border bg-white dark:bg-slate-900 theme-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <FilterIcon className="w-4 h-4 theme-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border theme-border text-xs font-semibold theme-text-primary bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="INITIATED">Initiated</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="p-12 text-center theme-text-secondary">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading transaction ledger...
        </div>
      ) : filtered.length === 0 ? (
        <div className="theme-card rounded-3xl border theme-border p-12 text-center theme-text-secondary">
          <ReceiptIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold theme-text-primary text-base">No Transactions Found</h3>
          <p className="text-xs theme-text-secondary mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search criteria or filter."
              : "You have not made any online fine payments yet."}
          </p>
        </div>
      ) : (
        <div className="theme-card rounded-3xl border theme-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 theme-text-secondary border-b theme-border uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border theme-text-primary">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {p.transactionId}
                    </td>
                    <td className="px-6 py-4 font-semibold max-w-xs truncate">{p.bookTitle}</td>
                    <td className="px-6 py-4 font-black">₹{p.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                        {p.paymentMethod?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          p.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : p.status === "FAILED"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {p.status === "SUCCESS" && <CheckCircleIcon className="w-3 h-3 text-emerald-600" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 theme-text-secondary">
                      {p.paidAt
                        ? p.paidAt.replace("T", " ").substring(0, 16)
                        : p.createdAt?.replace("T", " ").substring(0, 16)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === "SUCCESS" ? (
                        <Link
                          to={`/user/payments/${p.id}/receipt`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <ReceiptIcon className="w-3.5 h-3.5" />
                          Receipt
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
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
