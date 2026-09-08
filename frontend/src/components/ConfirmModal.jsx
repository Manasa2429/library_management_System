import React from "react";
import { AlertTriangleIcon, XIcon } from "./Icons";

export default function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {isDanger ? (
              <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangleIcon className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <AlertTriangleIcon className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-600 text-sm mt-4">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition shadow-sm ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
