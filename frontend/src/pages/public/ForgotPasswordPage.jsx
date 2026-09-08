import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { BookOpenIcon, CheckCircleIcon } from "../../components/Icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      addToast("Password reset instructions have been dispatched.", "success");
    } catch (err) {
      // Show generic confirmation anyway to avoid email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-200">
            <BookOpenIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
          <p className="text-slate-500 text-sm mt-1.5">Enter your email to receive a recovery token</p>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Check Your Inbox</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              If an account with <span className="font-semibold text-slate-900">{email}</span> exists, we've sent instructions and a secure token to reset your password.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                to={`/reset-password`}
                className="w-full py-2.5 px-4 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                I have a reset token
              </Link>
              <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Send Reset Instructions"
              )}
            </button>

            <div className="pt-4 text-center">
              <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-indigo-600">
                &larr; Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
