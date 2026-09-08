import React, { useEffect, useState } from "react";
import { settingService } from "../../services/fineService";
import { useToast } from "../../components/Toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    finePerDay: 10,
    borrowDurationDays: 14,
    maxBooksPerUser: 5,
    reservationExpiryDays: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await settingService.getSettings();
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingService.updateSettings(settings);
      setSettings(updated);
      addToast("Library system parameters saved successfully!", "success");
    } catch (err) {
      addToast("Failed to update system settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading system parameters...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Settings</h1>
        <p className="text-slate-300 text-sm mt-1">Configure global circulation rules, fine policies, and checkout caps.</p>
      </div>

      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Daily Overdue Fine Rate (₹ per day)
            </label>
            <input
              type="number"
              min="0"
              required
              value={settings.finePerDay}
              onChange={(e) => setSettings({ ...settings, finePerDay: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Applied automatically by daily scheduler for every overdue day.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Default Loan Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              required
              value={settings.borrowDurationDays}
              onChange={(e) => setSettings({ ...settings, borrowDurationDays: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Standard checkout period added to issue date when approving borrow requests.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Maximum Books Allowed per Member
            </label>
            <input
              type="number"
              min="1"
              required
              value={settings.maxBooksPerUser}
              onChange={(e) => setSettings({ ...settings, maxBooksPerUser: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Prevents users from submitting new requests if their active borrow count reaches this limit.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Waitlist Priority Hold Window (Days)
            </label>
            <input
              type="number"
              min="1"
              required
              value={settings.reservationExpiryDays}
              onChange={(e) => setSettings({ ...settings, reservationExpiryDays: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Number of days a waitlisted user has to checkout a returned copy before notifying the next in line.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {saving ? "Saving Policy..." : "Save System Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
