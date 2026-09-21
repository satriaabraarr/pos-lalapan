"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function AppLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUser(d.user))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen print:min-h-0 bg-surface-canvas">
      <Sidebar open={openSidebar} onClose={() => setOpenSidebar(false)} />
      <div className="lg:pl-[240px] flex flex-col min-h-screen print:min-h-0 print:pl-0">
        <Topbar user={user} onOpenSidebar={() => setOpenSidebar(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}