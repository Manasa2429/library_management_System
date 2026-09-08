import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { BookOpenIcon, EyeIcon, EyeOffIcon } from "../../components/Icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const user = await login(cleanEmail, password);
      addToast(`Welcome back, ${user.name || "Member"}!`, "success");

      // If email entered is divyasreemuppuri@gmail.com or role is ROLE_ADMIN, redirect to admin page; otherwise user page
      if (cleanEmail === "divyasreemuppuri@gmail.com" || user.role === "ROLE_ADMIN") {
        navigate("/admin/dashboard");
      } else {
        const from = location.state?.from?.pathname || "/user/dashboard";
        navigate(from);
      }
    } catch (err) {
      console.error("Login failed", err);
      const msg =
        err.response?.data?.message ||
        "Invalid email or password. Please verify your credentials.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 py-8 sm:py-12">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-4xl w-full overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Visual Brand Panel (Responsive on phone, tablet & desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-4 sm:mb-6">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
              SmartLibrary Portal
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Unlock Your Reading Journey
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
              Access curated reading collections, track ongoing borrow periods, and reserve popular waitlist titles seamlessly.
            </p>
          </div>

          <div className="relative z-10 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 hidden sm:block">
            <blockquote className="text-xs text-slate-300 italic leading-relaxed">
              "A room without books is like a body without a soul."
            </blockquote>
            <p className="text-[11px] font-semibold text-indigo-300 mt-1.5">— Marcus Tullius Cicero</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sign In</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Enter your email and password to access your SmartLibrary account.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg focus:outline-none transition"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{" "}
            <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
              Create an account free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
