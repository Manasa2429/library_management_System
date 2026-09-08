import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  LayoutDashboardIcon,
  BookOpenIcon,
  UsersIcon,
  TagIcon,
  ArrowLeftRightIcon,
  BookmarkIcon,
  CoinsIcon,
  CreditCardIcon,
  BellIcon,
  BarChart3Icon,
  FileTextIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  FeatherIcon,
  ShieldCheckIcon
} from "../components/Icons";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboardIcon },
    { label: "Books Catalog", path: "/admin/books", icon: BookOpenIcon },
    { label: "Authors", path: "/admin/authors", icon: FeatherIcon },
    { label: "Categories", path: "/admin/categories", icon: TagIcon },
    { label: "Circulation & Loans", path: "/admin/borrowing", icon: ArrowLeftRightIcon },
    { label: "Reservations Queue", path: "/admin/reservations", icon: BookmarkIcon },
    { label: "Fines & Penalties", path: "/admin/fines", icon: CoinsIcon },
    { label: "Online Payments", path: "/admin/payments", icon: CreditCardIcon },
    { label: "Member Directory", path: "/admin/users", icon: UsersIcon },
    { label: "Broadcast Alerts", path: "/admin/notifications", icon: BellIcon },
    { label: "Executive Analytics", path: "/admin/reports", icon: BarChart3Icon },
    { label: "System Audit Logs", path: "/admin/activity-log", icon: FileTextIcon },
    { label: "Circulation Rules", path: "/admin/settings", icon: SettingsIcon },
    { label: "Security Profile", path: "/admin/profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen theme-canvas flex flex-col md:flex-row antialiased selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 theme-sidebar border-b theme-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <ShieldCheckIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold theme-text-primary text-sm tracking-tight block">SmartLibrary Admin</span>
            <span className="text-[10px] text-amber-500 dark:text-amber-400 font-semibold uppercase">Platform Command</span>
          </div>
        </div>
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

      {/* Admin Sidebar - Deep Oxford Navy (Dark) / Clean Slate (Light) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 theme-sidebar border-r theme-border flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top brand */}
        <div>
          <div className="h-18 py-4 px-6 flex items-center justify-between border-b theme-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black theme-text-primary text-base tracking-tight block leading-none">
                  Smart<span className="text-indigo-600 dark:text-indigo-400 font-light">Admin</span>
                </span>
                <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider mt-1 block">
                  SmartLibrary Executive
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border-r-4 border-amber-400 font-bold"
                        : "theme-text-secondary hover:theme-text-primary hover:bg-slate-100 dark:hover:bg-white/5"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile info & Logout */}
        <div className="p-3 border-t theme-border">
          <div className="flex items-center justify-between px-2 py-2 mb-2 theme-card-subtle rounded-xl border theme-border">
            <div className="truncate pr-2">
              <p className="text-xs font-bold theme-text-primary truncate">{user?.name || "Administrator"}</p>
              <p className="text-[11px] theme-text-secondary truncate">{user?.email}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
              ADMIN
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-white hover:bg-rose-50 dark:hover:bg-rose-600/20 rounded-xl transition border border-rose-200 dark:border-rose-500/20"
          >
            <LogOutIcon className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 theme-canvas">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
