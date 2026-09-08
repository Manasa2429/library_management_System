import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircleIcon, AlertTriangleIcon, XIcon } from "./Icons";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border transition-all transform translate-y-0 duration-200 ${
              toast.type === "success"
                ? "bg-white text-emerald-900 border-emerald-200"
                : toast.type === "error"
                ? "bg-white text-rose-900 border-rose-200"
                : "bg-white text-slate-800 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
              {toast.type === "error" && <AlertTriangleIcon className="w-5 h-5 text-rose-500" />}
              {toast.type === "info" && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 ml-3"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { addToast: (msg) => console.log(msg) };
  }
  return context;
}
