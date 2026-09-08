import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fineService } from "../../services/fineService";
import { paymentService } from "../../services/paymentService";
import { useToast } from "../../components/Toast";
import {
  CoinsIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CreditCardIcon,
  ReceiptIcon,
  BookOpenIcon,
  ClockIcon
} from "../../components/Icons";

export default function MyFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unpaid"); // "unpaid" or "paid"
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleGenerateDemoFine = async () => {
    setGeneratingDemo(true);
    try {
      const fine = await fineService.generateDemoFine();
      addToast(`Generated demo fine of ₹${fine.fineAmount} for "${fine.bookTitle}"!`, "success");
      await loadFines();
      setActiveTab("unpaid");
    } catch (err) {
      console.error(err);
      addToast("Failed to generate demo fine.", "error");
    } finally {
      setGeneratingDemo(false);
    }
  };

  const loadFines = async () => {
    setLoading(true);
    try {
      const data = await fineService.getMyFines();
      setFines(data || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to load fine details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFines();
  }, []);

  const unpaidFines = fines.filter((f) => f.status === "UNPAID");
  const paidFines = fines.filter((f) => f.status === "PAID" || f.status === "WAIVED");

  const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + (f.fineAmount || 0), 0);
  const totalPaidAmount = fines
    .filter((f) => f.status === "PAID")
    .reduce((sum, f) => sum + (f.fineAmount || 0), 0);

  const handlePayNow = (fineId) => {
    navigate(`/user/payments/checkout/${fineId}`);
  };

  const handleViewReceipt = async (fineId) => {
    try {
      const payments = await paymentService.getPaymentsByFine(fineId);
      const successful = payments.find((p) => p.status === "SUCCESS") || payments[0];
      if (successful) {
        navigate(`/user/payments/${successful.id}/receipt`);
      } else {
        addToast("No online payment receipt found for this fine (it may have been settled at the counter).", "info");
      }
    } catch (err) {
      addToast("Unable to load receipt for this fine.", "error");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black theme-text-primary tracking-tight">My Library Fines</h1>
          <p className="theme-text-secondary text-sm mt-1">
            Review overdue loan penalties, settle dues with demo simulated payments, and view payment receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateDemoFine}
            disabled={generatingDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 transition disabled:opacity-50"
            title="Generate a sample overdue fine to test the simulated payment gateway"
          >
            {generatingDemo ? "Generating Fine..." : "+ Generate Demo Fine"}
          </button>
          <Link
            to="/user/payments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold theme-card-subtle theme-text-primary border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ReceiptIcon className="w-4 h-4 text-indigo-500" />
            Payment Ledger
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Outstanding Dues */}
        <div className="theme-card p-6 rounded-3xl border theme-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider block">Outstanding Dues</span>
            <span className="text-3xl font-black theme-text-primary mt-1 block">₹{totalUnpaidAmount.toFixed(0)}</span>
            <span className="text-xs theme-text-secondary mt-1 block">
              {unpaidFines.length} pending {unpaidFines.length === 1 ? "penalty" : "penalties"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <CoinsIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Settled */}
        <div className="theme-card p-6 rounded-3xl border theme-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block">Total Settled</span>
            <span className="text-3xl font-black theme-text-primary mt-1 block">₹{totalPaidAmount.toFixed(0)}</span>
            <span className="text-xs theme-text-secondary mt-1 block">Cleared fines & waivers</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Demo Gateway Badge */}
        <div className="theme-card p-6 rounded-3xl border theme-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-bold text-xs">
            <CreditCardIcon className="w-4 h-4" />
            <span>Simulated Gateway</span>
          </div>
          <p className="text-xs theme-text-secondary mt-2 leading-relaxed">
            All fine transactions use our self-contained mock gateway. No real bank accounts or money are charged.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b theme-border gap-2">
        <button
          onClick={() => setActiveTab("unpaid")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "unpaid"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent theme-text-secondary hover:theme-text-primary"
          }`}
        >
          <span>Outstanding Fines</span>
          {unpaidFines.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
              {unpaidFines.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("paid")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "paid"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent theme-text-secondary hover:theme-text-primary"
          }`}
        >
          <span>Settled & History</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold theme-card-subtle theme-text-secondary">
            {paidFines.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="p-12 text-center theme-text-secondary">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading fine records...
        </div>
      ) : activeTab === "unpaid" ? (
        unpaidFines.length === 0 ? (
          <div className="theme-card rounded-3xl border theme-border p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold theme-text-primary">No Outstanding Fines</h3>
            <p className="text-sm theme-text-secondary mt-1 max-w-sm mx-auto">
              You do not have any unpaid overdue fines on your library account. Keep up the timely returns!
            </p>
            <button
              onClick={handleGenerateDemoFine}
              disabled={generatingDemo}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
            >
              {generatingDemo ? "Generating..." : "+ Generate Demo Fine to Test Payment"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {unpaidFines.map((f) => (
              <div
                key={f.id}
                className="theme-card rounded-3xl border theme-border p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-1">
                    <AlertTriangleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold theme-text-primary">{f.bookTitle}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                        {f.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs theme-text-secondary mt-2">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {f.overdueDays} day{f.overdueDays === 1 ? "" : "s"} overdue
                      </span>
                      <span>•</span>
                      <span>Recorded on: {f.createdAt ? f.createdAt.substring(0, 10) : "Recent"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 theme-border">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] uppercase tracking-wider font-semibold theme-text-secondary block">
                      Fine Amount
                    </span>
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                      ₹{f.fineAmount.toFixed(0)}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePayNow(f.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition active:scale-95"
                  >
                    <CreditCardIcon className="w-4 h-4" />
                    Pay ₹{f.fineAmount.toFixed(0)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : paidFines.length === 0 ? (
        <div className="theme-card rounded-3xl border theme-border p-12 text-center theme-text-secondary">
          <BookOpenIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold theme-text-primary text-base">No Settlement History</h3>
          <p className="text-xs theme-text-secondary mt-1">Paid fines and waivers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paidFines.map((f) => (
            <div
              key={f.id}
              className="theme-card rounded-3xl border theme-border p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold theme-text-primary">{f.bookTitle}</h4>
                  <div className="flex items-center gap-3 text-xs theme-text-secondary mt-1">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">✓ {f.status}</span>
                    <span>•</span>
                    <span>Amount: ₹{f.fineAmount.toFixed(0)}</span>
                    {f.settledAt && (
                      <>
                        <span>•</span>
                        <span>Settled: {f.settledAt.substring(0, 10)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {f.status === "PAID" && (
                <button
                  onClick={() => handleViewReceipt(f.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold theme-card-subtle theme-text-primary border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ReceiptIcon className="w-3.5 h-3.5 text-indigo-500" />
                  View Receipt
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
