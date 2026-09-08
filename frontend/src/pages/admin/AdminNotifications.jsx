import React, { useEffect, useState } from "react";
import { notificationService } from "../../services/fineService";
import { BellIcon } from "../../components/Icons";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await notificationService.getAll();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Alerts & Notifications</h1>
        <p className="text-slate-300 text-sm mt-1">Platform-wide circulation events, due date reminders, and activity logs.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 animate-pulse h-20"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
          <BellIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-1">All events logged are up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <BellIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white truncate">{n.title}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
