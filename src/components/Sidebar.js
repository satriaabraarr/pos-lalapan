"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "./Icon";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "grid_view" },
  { href: "/transaksi", label: "Transaksi", icon: "point_of_sale" },
  { href: "/riwayat", label: "Riwayat Transaksi", icon: "receipt_long" },
  { href: "/menu", label: "Manajemen Menu", icon: "restaurant_menu" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden no-print" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 h-full w-[240px] bg-surface-card border-r border-border-subtle z-50
          flex flex-col justify-between transition-transform duration-200 no-print
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex flex-col">
          <div className="h-16 px-space-md flex items-center gap-space-sm border-b border-border-subtle">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-white shrink-0">
              <Icon name="restaurant" size={22} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-title-sm font-bold tracking-tight truncate">
                <span className="text-primary-container">POS</span> Lalapan
              </span>
              <span className="text-label-sm text-tertiary truncate">Kasir Warung Lalapan</span>
            </div>
          </div>

          <nav className="flex flex-col gap-space-xs p-space-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-primary-fixed text-primary font-semibold"
                    : "text-tertiary hover:bg-surface-canvas hover:text-on-surface"
                }`}
              >
                <Icon name={item.icon} />
                <span className="text-label-md">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-space-sm border-t border-border-subtle">
          <button
            onClick={logout}
            className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg
                       text-status-danger hover:bg-error-container transition-colors"
          >
            <Icon name="logout" />
            <span className="text-label-md font-medium">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
