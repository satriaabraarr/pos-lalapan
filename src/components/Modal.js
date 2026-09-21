"use client";
import { useEffect } from "react";
import Icon from "./Icon";

export default function Modal({ open, title, onClose, children, footer, width = "max-w-lg" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center print:contents">
      <div className="absolute inset-0 bg-[rgba(31,41,55,0.45)] no-print" onClick={onClose} />
      <div className={`relative w-full ${width} bg-surface-card rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col print:contents`}>
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-border-subtle no-print">
          <h2 className="text-headline-md">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-tertiary hover:bg-surface-canvas" aria-label="Tutup">
            <Icon name="close" />
          </button>
        </div>
        <div className="px-space-lg py-space-md overflow-y-auto print:contents">{children}</div>
        {footer && <div className="px-space-lg py-space-md border-t border-border-subtle flex justify-end gap-space-sm no-print">{footer}</div>}
      </div>
    </div>
  );
}