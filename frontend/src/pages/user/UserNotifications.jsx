import React, { useEffect, useState } from "react";
import { notificationService } from "../../services/fineService";
import { useToast } from "../../components/Toast";
import { BellIcon } from "../../components/Icons";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      addToast("All notifications marked as read", "success");
    } catch (err) {
      addToast("Failed to mark all as read", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Due date reminders, request approvals, and waitlist availability notices.</p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-20"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto">
          <BellIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Inbox Clean</h3>
          <p className="text-xs text-slate-500 mt-1">You have no new alerts or notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                !n.read
                  ? "bg-indigo-50/40 border-indigo-200 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  !n.read ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                <BellIcon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-bold truncate ${!n.read ? "text-slate-900" : "text-slate-700"}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" title="Unread"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
