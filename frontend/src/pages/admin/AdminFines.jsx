import React, { useEffect, useState } from "react";
import { fineService } from "../../services/fineService";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { CoinsIcon, CheckCircleIcon } from "../../components/Icons";

export default function AdminFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [selectedFine, setSelectedFine] = useState(null);
  const [actionType, setActionType] = useState(null); // 'pay' or 'waive'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [generatingDemo, setGeneratingDemo] = useState(false);

  const { addToast } = useToast();

  const handleGenerateAdminDemoFines = async () => {
    setGeneratingDemo(true);
    try {
      const res = await fineService.generateAdminDemoFines();
      addToast(`Generated ${res?.length || "new"} demo fines across readers successfully!`, "success");
      await loadFines();
    } catch (err) {
      console.error(err);
      addToast("Failed to generate demo fines", "error");
    } finally {
      setGeneratingDemo(false);
    }
  };

  const loadFines = async () => {
    setLoading(true);
    try {
      const data = await fineService.getAll();
      setFines(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load fines", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFines();
  }, []);

  const openAction = (fine, type) => {
    setSelectedFine(fine);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedFine) return;
    try {
      if (actionType === "pay") {
        await fineService.pay(selectedFine.id);
        addToast(`Fine of ₹${selectedFine.fineAmount} marked as PAID for ${selectedFine.userName}`, "success");
      } else {
        await fineService.waive(selectedFine.id);
        addToast(`Fine for ${selectedFine.userName} waived by Administrator.`, "info");
      }
      setIsConfirmOpen(false);
      setSelectedFine(null);
      await loadFines();
    } catch (err) {
      addToast("Failed to update fine status", "error");
    }
  };

  const filtered = fines.filter((f) => {
    if (filter === "unpaid") return f.status === "UNPAID";
    if (filter === "paid") return f.status === "PAID";
    if (filter === "waived") return f.status === "WAIVED";
    return true;
  });

  const totalUnpaid = fines
    .filter((f) => f.status === "UNPAID")
    .reduce((sum, f) => sum + (f.fineAmount || 0), 0);

  const totalCollected = fines
    .filter((f) => f.status === "PAID")
    .reduce((sum, f) => sum + (f.fineAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Fines & Penalties</h1>
          <p className="text-slate-300 text-sm mt-1">Manage overdue penalties, collect payments, and approve waivers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateAdminDemoFines}
            disabled={generatingDemo}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm active:scale-95 disabled:opacity-50"
            title="Generate sample overdue fines across reader accounts"
          >
            {generatingDemo ? "Generating Fines..." : "+ Generate Demo Fines"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-200 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Fines</option>
              <option value="unpaid">Unpaid Penalties</option>
              <option value="paid">Settled / Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
            <h3 className="text-3xl font-black text-rose-400 mt-1">₹{totalUnpaid.toFixed(0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <CoinsIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-1">₹{totalCollected.toFixed(0)}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 animate-pulse h-16"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
          <CoinsIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Fines Found</h3>
          <p className="text-xs text-slate-400 mt-1">No fine records match your filter.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Borrower</th>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Overdue Days</th>
                  <th className="px-6 py-4">Fine Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block">{f.userName}</span>
                      <span className="text-xs text-slate-400">{f.userEmail}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-200">{f.bookTitle}</td>
                    <td className="px-6 py-4 text-xs font-bold text-rose-400">{f.overdueDays} days</td>
                    <td className="px-6 py-4 text-xs font-black text-white">₹{f.fineAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        f.status === "UNPAID"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : f.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {f.status === "UNPAID" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAction(f, "pay")}
                            className="px-3.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => openAction(f, "waive")}
                            className="px-3.5 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                          >
                            Waive
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-mono">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title={actionType === "pay" ? "Record Fine Payment" : "Waive Member Fine"}
        message={
          actionType === "pay"
            ? `Mark ₹${selectedFine?.fineAmount} payment for ${selectedFine?.userName} on "${selectedFine?.bookTitle}" as PAID?`
            : `Waive the fine of ₹${selectedFine?.fineAmount} for ${selectedFine?.userName}? This fine balance will be cleared.`
        }
        confirmText={actionType === "pay" ? "Confirm Payment" : "Confirm Waiver"}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setIsConfirmOpen(false);
          setSelectedFine(null);
        }}
      />
    </div>
  );
}
