import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/fineService";
import ThemeToggle from "../components/ThemeToggle";
import {
  LayoutDashboardIcon,
  BookOpenIcon,
  ArrowLeftRightIcon,
  BookmarkIcon,
  HeartIcon,
  FileTextIcon,
  BellIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  ClockIcon,
  CoinsIcon,
  CreditCardIcon
} from "../components/Icons";

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        // silent catch
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/user/dashboard", icon: LayoutDashboardIcon },
    { label: "Browse Books", path: "/user/books", icon: BookOpenIcon },
    { label: "My Books", path: "/user/my-books", icon: ClockIcon },
    { label: "Borrow Requests", path: "/user/borrow-requests", icon: ArrowLeftRightIcon },
    { label: "Reservations", path: "/user/reservations", icon: BookmarkIcon },
    { label: "Favorites", path: "/user/favorites", icon: HeartIcon },
    { label: "My Fines", path: "/user/fines", icon: CoinsIcon },
    { label: "Payment History", path: "/user/payments", icon: CreditCardIcon },
    { label: "History", path: "/user/history", icon: FileTextIcon },
    { label: "Notifications", path: "/user/notifications", icon: BellIcon, badge: unreadCount },
    { label: "Profile", path: "/user/profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen theme-canvas flex flex-col md:flex-row antialiased transition-colors duration-200">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 theme-sidebar border-b theme-border">
        <Link to="/user/dashboard" className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
          <BookOpenIcon className="w-6 h-6" />
          <span className="theme-text-primary font-extrabold">Smart<span className="text-indigo-600 dark:text-indigo-400">Library</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 theme-text-secondary">
            {sidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-xs transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* User Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 theme-sidebar border-r theme-border flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 px-6 flex items-center justify-between border-b theme-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none">
                <BookOpenIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold theme-text-primary text-base tracking-tight block">Smart<span className="text-indigo-600 dark:text-indigo-400">Library</span></span>
                <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">Reader Workspace</span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Nav links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white font-bold shadow-sm border-r-4 border-amber-400"
                        : "theme-text-secondary hover:theme-text-primary hover:bg-slate-100 dark:hover:bg-white/5 font-medium"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Profile info & Logout */}
        <div className="p-3 border-t theme-border">
          <div className="flex items-center justify-between px-2 py-1.5 mb-2 theme-card-subtle p-2 rounded-xl border theme-border">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold theme-text-primary truncate">{user?.name || "Member"}</p>
              <p className="text-[11px] theme-text-secondary truncate">{user?.email}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
              MEMBER
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition border border-rose-200 dark:border-rose-500/20"
          >
            <LogOutIcon className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main User Content Area */}
      <div className="flex-1 flex flex-col min-w-0 theme-canvas">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
