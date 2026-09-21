"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import { rupiah, jam, hariIni } from "@/lib/format";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/daily?date=${hariIni()}`)
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="text-headline-lg tracking-tight">Dashboard</h1>
          <p className="text-body-sm text-tertiary">Ringkasan aktivitas warung hari ini</p>
        </div>
        <Link href="/transaksi" className="btn-primary">
          <Icon name="add" /> Transaksi Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <StatCard label="Pemasukan Hari Ini" value={loading ? "…" : rupiah(data?.totalPemasukan)} icon="payments" />
        <StatCard label="Transaksi Hari Ini" value={loading ? "…" : data?.jumlahTransaksi ?? 0} icon="receipt_long" />
        <StatCard label="Menu Tersedia" value={loading ? "…" : data?.menuTersedia ?? 0} icon="restaurant_menu" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-space-md py-space-md border-b border-border-subtle">
          <h2 className="text-headline-md">Transaksi Terbaru</h2>
          <Link href="/riwayat" className="text-label-md text-primary-container font-semibold hover:underline">
            Lihat semua
          </Link>
        </div>

        {loading ? (
          <div className="p-space-lg text-body-sm text-tertiary">Memuat data…</div>
        ) : !data?.transaksiTerbaru?.length ? (
          <EmptyState
            icon="receipt_long"
            title="Belum ada transaksi hari ini"
            description="Transaksi yang tersimpan akan muncul di sini."
            action={<Link href="/transaksi" className="btn-primary mt-space-sm"><Icon name="add" /> Mulai Transaksi</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="bg-surface-canvas text-label-md text-tertiary">
                <tr>
                  <th className="text-left px-space-md py-3 font-semibold">No. Transaksi</th>
                  <th className="text-left px-space-md py-3 font-semibold">Waktu</th>
                  <th className="text-left px-space-md py-3 font-semibold hidden sm:table-cell">Item</th>
                  <th className="text-right px-space-md py-3 font-semibold">Total</th>
                  <th className="px-space-md py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.transaksiTerbaru.map((t) => (
                  <tr key={t.id} className="border-t border-border-subtle hover:bg-surface-canvas">
                    <td className="px-space-md py-3 font-semibold">{t.transactionNumber}</td>
                    <td className="px-space-md py-3 text-tertiary">{jam(t.createdAt)}</td>
                    <td className="px-space-md py-3 text-tertiary hidden sm:table-cell">
                      {t.items.reduce((a, i) => a + i.quantity, 0)} item
                    </td>
                    <td className="px-space-md py-3 text-right font-semibold">{rupiah(t.totalAmount)}</td>
                    <td className="px-space-md py-3 text-right">
                      <Link href={`/riwayat/${t.id}`} className="text-primary-container hover:underline text-label-md font-semibold">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
