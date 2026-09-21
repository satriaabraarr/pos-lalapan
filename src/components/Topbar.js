"use client";
import Icon from "./Icon";

export default function Topbar({ user, onOpenSidebar }) {
  return (
    <header className="sticky top-0 h-16 bg-surface-card border-b border-border-subtle z-30
                       flex items-center justify-between px-space-md sm:px-space-lg gap-space-md no-print">
      <button onClick={onOpenSidebar} className="lg:hidden p-2 -ml-2 rounded-lg text-on-surface hover:bg-surface-canvas" aria-label="Buka menu">
        <Icon name="menu" size={24} />
      </button>

      <div className="flex items-center gap-space-sm ml-auto">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white">
          <Icon name="person" size={20} />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-label-md font-semibold leading-tight">{user?.name || "Pengguna"}</span>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-label-sm font-semibold w-fit capitalize">
            {user?.role || "kasir"}
          </span>
        </div>
      </div>
    </header>
  );
}
