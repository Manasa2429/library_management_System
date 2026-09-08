import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportService, activityLogService } from "../../services/fineService";
import { bookService } from "../../services/bookService";
import { useToast } from "../../components/Toast";
import {
  BookOpenIcon,
  UsersIcon,
  ArrowLeftRightIcon,
  AlertTriangleIcon,
  ClockIcon,
  CoinsIcon,
  BookmarkIcon,
  DownloadIcon,
  PlusIcon,
  SparklesIcon
} from "../../components/Icons";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const { addToast } = useToast();

  const loadStats = async () => {
    try {
      const [statsData, logsData] = await Promise.all([
        reportService.getDashboardStats(),
        activityLogService.getRecent().catch(() => []),
      ]);
      setStats(statsData);
      setRecentLogs(Array.isArray(logsData) ? logsData.slice(0, 6) : []);
    } catch (err) {
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSeedSampleBooks = async () => {
    setSeedingLoading(true);
    try {
      const res = await bookService.seedSamples();
      addToast(
        res.message || `Sample catalog synchronized! Total books: ${res.totalBooks}`,
        "success"
      );
      await loadStats();
    } catch (err) {
      console.error("Failed to seed sample books", err);
      addToast("Failed to synchronize sample catalog", "error");
    } finally {
      setSeedingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-28"></div>
          ))}
        </div>
      </div>
    );
  }

  const s = stats || {};

  // Compute live genre distribution from MongoDB stats
  const categoryMap = s.booksByCategory || s.categoryDistribution || {};
  const totalVolumes = s.totalBooks || Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
  const genreList = Object.entries(categoryMap)
    .map(([cat, count]) => ({
      cat,
      count,
      pct: Math.round((count / totalVolumes) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const displayLogs = recentLogs.length > 0 ? recentLogs : (s.recentActivities || []);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Welcome & Executive Action Bar */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-7 sm:p-9 text-white border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-bold uppercase tracking-widest mb-3 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Administrative Command Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Platform Overview & Metrics
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              Real-time database telemetry, automated book circulation approvals, waitlist prioritization, and system audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedSampleBooks}
              disabled={seedingLoading}
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <SparklesIcon className="w-4 h-4 text-amber-400" />
              {seedingLoading ? "Syncing 20 Books..." : "Seed 20 Sample Books"}
            </button>
            <Link
              to="/admin/books"
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <PlusIcon className="w-4 h-4" /> Add New Volume
            </Link>
            <a
              href={reportService.exportBooksCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/15 transition"
            >
              <DownloadIcon className="w-4 h-4" /> Export CSV Data
            </a>
          </div>
        </div>
      </div>

      {/* Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="theme-card p-6 rounded-3xl border theme-border shadow-md hover:shadow-lg hover:border-indigo-500/50 transition duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1 rounded-full">
              Catalog
            </span>
          </div>
          <p className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Total Volumes</p>
          <h3 className="text-2xl sm:text-3xl font-black theme-text-primary mt-1">{s.totalBooks ?? 0}</h3>
          <span className="text-xs theme-text-secondary mt-1 block">
            <strong className="theme-text-primary">{s.availableCopies ?? s.availableBooks ?? 0}</strong> copies on shelf
          </span>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-md hover:shadow-lg hover:border-emerald-500/50 transition duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition">
              <UsersIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
              Members
            </span>
          </div>
          <p className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Registered Readers</p>
          <h3 className="text-2xl sm:text-3xl font-black theme-text-primary mt-1">{s.totalUsers ?? 0}</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {s.activeMembers ?? s.totalUsers ?? 0} active accounts
          </span>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-md hover:shadow-lg hover:border-blue-500/50 transition duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition">
              <ArrowLeftRightIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-2.5 py-1 rounded-full">
              Circulation
            </span>
          </div>
          <p className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Currently Borrowed</p>
          <h3 className="text-2xl sm:text-3xl font-black theme-text-primary mt-1">{s.currentlyBorrowed ?? s.borrowedBooks ?? 0}</h3>
          <span className="text-xs theme-text-secondary mt-1 block">
            {s.totalBorrowsAllTime ?? 0} cumulative loans
          </span>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-md hover:shadow-lg hover:border-amber-500/50 transition duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center shadow-inner group-hover:bg-amber-600 group-hover:text-white transition">
              <ClockIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full">
              Action Req.
            </span>
          </div>
          <p className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Pending Requests</p>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{s.pendingRequests ?? 0}</h3>
          <Link to="/admin/borrowing" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline mt-1 inline-block">
            Review approvals &rarr;
          </Link>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-md hover:shadow-lg hover:border-rose-500/50 transition duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shadow-inner group-hover:bg-rose-600 group-hover:text-white transition">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1 rounded-full">
              Urgent
            </span>
          </div>
          <p className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Overdue Books</p>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{s.overdueBooks ?? 0}</h3>
          <span className="text-xs text-rose-500 dark:text-rose-400/80 mt-1 block">Accruing standard fines</span>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-md hover:shadow-lg hover:border-purple-500/50 transition duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shadow-inner group-hover:bg-purple-600 group-hover:text-white transition">
              <BookmarkIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2.5 py-1 rounded-full">
              Waitlist
            </span>
          </div>
          <p className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Active Reservations</p>
          <h3 className="text-2xl sm:text-3xl font-black theme-text-primary mt-1">{s.activeReservations ?? 0}</h3>
          <span className="text-xs text-purple-600 dark:text-purple-400 mt-1 block">Auto-notified on returns</span>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-md hover:shadow-lg hover:border-emerald-500/50 transition duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition">
              <CoinsIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
              Revenue
            </span>
          </div>
          <p className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Fines Collected</p>
          <h3 className="text-2xl sm:text-3xl font-black theme-text-primary mt-1">₹{(s.totalFinesCollected ?? s.paidFines ?? 0).toFixed(0)}</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">Settled penalties</span>
        </div>

        <div className="theme-card p-6 rounded-3xl border theme-border shadow-md hover:shadow-lg hover:border-rose-500/50 transition duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shadow-inner group-hover:bg-rose-600 group-hover:text-white transition">
              <CoinsIcon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-xs font-bold theme-text-secondary uppercase tracking-wider">Unpaid Fines</p>
          <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">₹{(s.unpaidFinesTotal ?? s.unpaidFines ?? 0).toFixed(0)}</h3>
          <Link to="/admin/fines" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline mt-1 inline-block">
            Collect / Waive &rarr;
          </Link>
        </div>
      </div>

      {/* Analytics & Activity Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Distribution */}
        <div className="theme-card rounded-3xl border theme-border p-7 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Breakdown</span>
              <h3 className="text-lg font-bold theme-text-primary">Genre Distribution</h3>
            </div>
            <Link to="/admin/categories" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Manage &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {genreList.length > 0 ? (
              genreList.map(({ cat, count, pct }) => (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="theme-text-primary truncate pr-2">{cat}</span>
                    <span className="theme-text-secondary font-mono shrink-0">{count} vols ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs theme-text-secondary py-8 text-center">
                No genre classification data recorded in database.
              </p>
            )}
          </div>
        </div>

        {/* Recent Audit Trail */}
        <div className="lg:col-span-2 theme-card rounded-3xl border theme-border p-7 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">Security & Compliance</span>
                <h3 className="text-lg font-bold theme-text-primary">Recent Audit Trail</h3>
              </div>
              <Link to="/admin/activity-log" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                View Complete Log &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {displayLogs.length > 0 ? (
                displayLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3.5 rounded-2xl theme-card-subtle border theme-border text-xs transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                          {log.action}
                        </span>
                        <span className="theme-text-primary font-semibold">{log.description || log.details}</span>
                      </div>
                      <p className="text-[11px] theme-text-secondary mt-1">
                        Operator: <span className="text-indigo-600 dark:text-indigo-300 font-mono">{log.userEmail || "System Automation"}</span>
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap ml-3">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs theme-text-secondary">
                  No recent activity recorded yet in system audit logs.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

