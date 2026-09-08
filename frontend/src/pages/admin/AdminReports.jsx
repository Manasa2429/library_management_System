import React, { useEffect, useState } from "react";
import { reportService } from "../../services/fineService";
import { BarChart3Icon, DownloadIcon, BookOpenIcon, ArrowLeftRightIcon, CreditCardIcon, CoinsIcon } from "../../components/Icons";

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await reportService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading analytics & report datasets...</div>;
  }

  const s = stats || {};

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-300 text-sm mt-1">Export circulation data, review inventory metrics, and analyze loan velocity.</p>
        </div>
      </div>

      {/* CSV Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Books Catalog Dataset</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Export complete list of titles, ISBN, authors, categories, copies, and shelf locations in CSV format.
            </p>
          </div>
          <div className="pt-6">
            <a
              href={reportService.exportBooksCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              <DownloadIcon className="w-4 h-4" /> Download Books CSV
            </a>
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <ArrowLeftRightIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Circulation Records</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Export borrowing histories, borrower names, emails, loan issue dates, due dates, and return statuses in CSV.
            </p>
          </div>
          <div className="pt-6">
            <a
              href={reportService.exportBorrowsCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              <DownloadIcon className="w-4 h-4" /> Download Loans CSV
            </a>
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <CreditCardIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Online Payments Ledger</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Export complete transaction histories, transaction IDs, member emails, amounts, methods, and timestamps in CSV.
            </p>
          </div>
          <div className="pt-6">
            <a
              href={reportService.exportPaymentsCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition"
            >
              <DownloadIcon className="w-4 h-4" /> Download Payments CSV
            </a>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl">
        <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3Icon className="w-5 h-5 text-indigo-400" />
          Catalog Category Distribution
        </h3>

        {(!s.categoryDistribution && !s.booksByCategory) || Object.keys(s.categoryDistribution || s.booksByCategory || {}).length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No categories recorded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(s.categoryDistribution || s.booksByCategory || {}).map(([cat, count]) => {
              const total = s.totalBooks || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-slate-200">{cat}</span>
                    <span className="text-slate-400 font-mono">{count} titles ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fine Collection & Payment Method Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fine Settlement Ratio */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CoinsIcon className="w-5 h-5 text-emerald-400" />
            Fine Settlement & Online Recovery
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Total Assessed Fines</span>
              <span className="text-xl font-black text-white mt-1 block">₹{(s.totalFines || 0).toFixed(0)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Total Collected / Settled</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">₹{(s.totalFinesCollected || 0).toFixed(0)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Outstanding Unpaid</span>
              <span className="text-xl font-black text-rose-400 mt-1 block">₹{(s.unpaidFines || 0).toFixed(0)}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Online Collected (Demo)</span>
              <span className="text-xl font-black text-indigo-400 mt-1 block">₹{(s.onlinePaymentsCollected || 0).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Simulated Payment Channel Distribution */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-indigo-400" />
            Simulated Payment Method Distribution
          </h3>

          {!s.paymentMethodDistribution || Object.keys(s.paymentMethodDistribution).length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No online payment transactions processed yet. Settlements will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(s.paymentMethodDistribution).map(([method, count]) => {
                const total = s.totalOnlinePayments || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={method} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-slate-200">{method.replace("_", " ")}</span>
                      <span className="text-slate-400 font-mono">{count} transactions ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
