import React, { useEffect, useState } from "react";
import { activityLogService } from "../../services/fineService";
import { FileTextIcon } from "../../components/Icons";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadLogs = async (p = 0) => {
    setLoading(true);
    try {
      const data = await activityLogService.getLogs(p, 15);
      setLogs(data.content || []);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(0);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Audit Log</h1>
        <p className="text-slate-300 text-sm mt-1">Immutable security and operations audit record of library events.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 animate-pulse h-16"></div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 text-center max-w-md mx-auto shadow-xl">
          <FileTextIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Activity Logs</h3>
          <p className="text-xs text-slate-400 mt-1">Logged system actions will appear here.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-white font-mono">
                      {log.userEmail || "System Automation"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300 max-w-md">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => loadLogs(page - 1)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => loadLogs(page + 1)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
