import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import { useToast } from "../../components/Toast";
import {
  CheckCircleIcon,
  PrinterIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  AlertTriangleIcon
} from "../../components/Icons";
import ConfettiEffect from "../../components/ConfettiEffect";

export default function PaymentReceipt() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayment() {
      setLoading(true);
      try {
        const data = await paymentService.getPaymentById(paymentId);
        setPayment(data);
      } catch (err) {
        console.error(err);
        addToast("Failed to load payment receipt.", "error");
        navigate("/user/fines");
      } finally {
        setLoading(false);
      }
    }
    loadPayment();
  }, [paymentId, navigate, addToast]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center theme-text-secondary">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Generating official receipt...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-12 text-center theme-text-secondary">
        <AlertTriangleIcon className="w-10 h-10 mx-auto text-rose-500 mb-3" />
        <h3 className="font-bold theme-text-primary">Receipt Not Found</h3>
        <Link to="/user/fines" className="text-xs text-indigo-600 underline mt-2 inline-block">
          Return to Fines
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Celebration Confetti */}
      {payment.status === "SUCCESS" && <ConfettiEffect duration={2500} />}

      {/* Top Action Bar (Hidden during print) */}
      <div className="print:hidden flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs theme-text-secondary">
          <Link to="/user/fines" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            My Fines
          </Link>
          <span>&rarr;</span>
          <Link to="/user/payments" className="hover:text-indigo-600 dark:hover:text-indigo-400">
            Payment History
          </Link>
          <span>&rarr;</span>
          <span className="theme-text-primary font-semibold">Receipt</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <PrinterIcon className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <div
        id="receipt-card"
        className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-lg relative overflow-hidden print:border-none print:shadow-none print:p-4 animate-pop-in"
      >
        {/* Official Library Paid Watermark Stamp */}
        {payment.status === "SUCCESS" && (
          <div className="absolute right-4 bottom-20 sm:right-10 sm:bottom-24 opacity-20 pointer-events-none transform -rotate-12 select-none border-4 border-emerald-600 rounded-2xl p-3 text-center print:opacity-40">
            <div className="text-xl font-black text-emerald-600 tracking-widest uppercase">PAID & SETTLED</div>
            <div className="text-[9px] font-bold text-emerald-700 tracking-wider">SMARTLIBRARY • DIGITAL SEAL</div>
          </div>
        )}

        {/* Top Decorative Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg tracking-tight block">
                Smart<span className="text-indigo-600">Library</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Digital Knowledge & Circulation Center</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
              Official Receipt
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              {payment.paidAt ? payment.paidAt.substring(0, 10) : payment.createdAt?.substring(0, 10)}
            </span>
          </div>
        </div>

        {/* Transaction Hero */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction ID</span>
            <span className="text-base font-mono font-black text-slate-900 mt-0.5 block tracking-wide">
              {payment.transactionId}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Method: <strong>{payment.paymentMethod?.replace("_", " ")}</strong>
            </span>
          </div>

          <div className="text-center sm:text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                payment.status === "SUCCESS"
                  ? "bg-emerald-100 text-emerald-800"
                  : payment.status === "FAILED"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {payment.status === "SUCCESS" && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />}
              {payment.status}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-2">₹{payment.amount?.toFixed(2)}</div>
          </div>
        </div>

        {/* Itemized Details Table */}
        <div className="space-y-4 mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Breakdown</h4>

          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <div className="grid grid-cols-12 bg-slate-100/70 px-4 py-2.5 font-bold text-slate-600 border-b border-slate-200">
              <span className="col-span-8">Description</span>
              <span className="col-span-4 text-right">Amount (INR)</span>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 px-4 py-3 items-center">
                <div className="col-span-8">
                  <span className="font-bold text-slate-800 block">{payment.bookTitle}</span>
                  <span className="text-[11px] text-slate-400">Overdue fine penalty settlement</span>
                </div>
                <div className="col-span-4 text-right font-bold text-slate-800">₹{payment.amount?.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-12 px-4 py-2.5 items-center text-slate-500">
                <span className="col-span-8">Platform & Processing Fee</span>
                <span className="col-span-4 text-right text-emerald-600 font-semibold">₹0.00 (Demo)</span>
              </div>
            </div>

            <div className="grid grid-cols-12 px-4 py-3 bg-slate-50 border-t border-slate-200 font-black text-slate-900 text-sm">
              <span className="col-span-8">Total Paid</span>
              <span className="col-span-4 text-right text-indigo-600">₹{payment.amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Member & Verification Information */}
        <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-6 mb-6">
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">Issued To</span>
            <span className="font-bold text-slate-900 mt-1 block">{payment.userName}</span>
            <span className="text-slate-500 block">{payment.userEmail}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">Gateway Notes</span>
            <span className="text-slate-600 mt-1 block font-mono text-[11px]">
              {payment.notes || "Simulated mock payment settlement"}
            </span>
          </div>
        </div>

        {/* Demo Seal Footer */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-slate-600 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-indigo-900 block">Certified Demo Transaction</span>
            This official receipt was generated by SmartLibrary's simulated payment system for educational and demonstration purposes. No actual money was debited from any bank account.
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Hidden during print) */}
      <div className="print:hidden flex items-center justify-between text-xs pt-2">
        <Link to="/user/fines" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
          &larr; Back to My Fines
        </Link>
        <Link to="/user/payments" className="font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white">
          View All Transactions &rarr;
        </Link>
      </div>
    </div>
  );
}
