import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpenIcon, LogOutIcon, MenuIcon, XIcon } from "../components/Icons";
import ThemeToggle from "../components/ThemeToggle";

export default function PublicLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navigation - Dual Light/Dark Glass */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <BookOpenIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-black text-xl tracking-tight block leading-none">
                Smart<span className="text-indigo-600 dark:text-indigo-400 font-medium">Library</span>
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400/90 tracking-wider font-semibold uppercase">
                Digital Knowledge Center
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-white transition duration-200">Home</Link>
            <Link to="/explore" className="hover:text-indigo-600 dark:hover:text-white transition duration-200 flex items-center gap-1.5">
              <span>Explore Catalog</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-400/30">5K+</span>
            </Link>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-white transition duration-200">How It Works</a>
            <a href="#featured" className="hover:text-indigo-600 dark:hover:text-white transition duration-200">Featured</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Desktop Auth CTA */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                >
                  Go to {isAdmin ? "Admin Portal" : "My Dashboard"} &rarr;
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition"
                  title="Logout"
                >
                  <LogOutIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-md shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
              </div>
            )}

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Home
              </Link>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition flex items-center justify-between"
              >
                <span>Explore Catalog</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-full">5K+</span>
              </Link>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                How It Works
              </a>
              <a
                href="#featured"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                Featured Collections
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
              {user ? (
                <>
                  <Link
                    to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md block"
                  >
                    Go to {isAdmin ? "Admin Portal" : "My Dashboard"} &rarr;
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 px-4 text-center text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 text-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 rounded-xl hover:bg-slate-200 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Executive Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                  <BookOpenIcon className="w-5 h-5" />
                </div>
                <span className="text-white font-extrabold text-xl tracking-tight">
                  Smart<span className="text-indigo-400 font-light">Library</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                A modern digital and physical library platform delivering seamless catalog browsing, intelligent waitlist queues, automated lending workflows, and reading history tracking.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Catalog Online 24/7
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                  Spring Security 6.0
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-indigo-300 transition">Home Catalog</Link></li>
                <li><Link to="/explore" className="hover:text-indigo-300 transition">All Books & Titles</Link></li>
                <li><Link to="/login" className="hover:text-indigo-300 transition">Reader & Admin Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-indigo-300 transition">Create Free Account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Architecture & Tech</h4>
              <div className="flex flex-col gap-2 text-xs text-slate-400 font-mono">
                <span className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span>Frontend</span>
                  <span className="text-indigo-300">React 19 & Tailwind</span>
                </span>
                <span className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span>Backend</span>
                  <span className="text-indigo-300">Spring Boot 3.5</span>
                </span>
                <span className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span>Database</span>
                  <span className="text-indigo-300">MongoDB Atlas</span>
                </span>
                <span className="flex items-center justify-between py-1">
                  <span>Auth</span>
                  <span className="text-emerald-400">JWT & BCrypt</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} SmartLibrary Digital Management Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-300 transition cursor-pointer">Security & Privacy</span>
              <span className="hover:text-slate-300 transition cursor-pointer">Lending Guidelines</span>
              <span className="hover:text-slate-300 transition cursor-pointer">API Reference</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
