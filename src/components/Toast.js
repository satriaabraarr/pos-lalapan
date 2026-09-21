"use client";
import { createContext, useCallback, useContext, useState } from "react";
import Icon from "./Icon";

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`card flex items-center gap-space-sm px-space-md py-3 min-w-[260px] max-w-[90vw] shadow-lg
              ${t.type === "error" ? "border-l-4 border-l-status-danger" : "border-l-4 border-l-status-success"}`}
          >
            <Icon
              name={t.type === "error" ? "error" : "check_circle"}
              className={t.type === "error" ? "text-status-danger" : "text-status-success"}
            />
            <span className="text-body-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
