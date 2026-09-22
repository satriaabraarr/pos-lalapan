"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import StatCard from "@/components/StatCard";
import LineChart from "@/components/LineChart";
import EmptyState from "@/components/EmptyState";
import { rupiah, rupiahSingkat, jam } from "@/lib/format";

function bulanIni() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }).slice(0, 7);
}

function namaBulan(bulanStr) {
  const [y, m] = bulanStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function geserBulan(bulanStr, delta) {
  const [y, m] = bulanStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function LaporanBulananPage() {
  const [bulan, setBulan] = useState(bulanIni());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/monthly?month=${bulan}`)
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .finally(() => setLoading(false));
  }, [bulan]);

  const chartData = useMemo(
    () => (data?.harian || []).map((h) => ({ label: String(h.tanggal), value: h.total })),
    [data]
  );

  const rataRataHarian = data?.daysInMonth ? Math.round(data.totalPemasukan / data.daysInMonth) : 0;
  const belumAdaTransaksi = !loading && data?.jumlahTransaksi === 0;
  const transaksiBulanIni = data?.transaksi || [];

  return (
    <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="text-headline-lg tracking-tight">Laporan Bulanan</h1>
          <p className="text-body-sm text-tertiary">Tren pemasukan warung dari bulan ke bulan</p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setBulan((b) => geserBulan(b, -1))}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-canvas"
            aria-label="Bulan sebelumnya"
          >
            <Icon name="chevron_left" />
          </button>
          <span className="text-title-sm min-w-[168px] text-center capitalize">{namaBulan(bulan)}</span>
          <button
            onClick={() => setBulan((b) => geserBulan(b, 1))}
            disabled={bulan === bulanIni()}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-subtle bg-surface-card
                       hover:bg-surface-canvas disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Bulan berikutnya"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md items-stretch">
        <div className="flex flex-col gap-space-md">
          <StatCard label="Total Pemasukan" value={loading ? "…" : rupiah(data?.totalPemasukan)} icon="payments" />
          <StatCard label="Jumlah Transaksi" value={loading ? "…" : data?.jumlahTransaksi ?? 0} icon="receipt_long" />
          <StatCard label="Rata-rata per Hari" value={loading ? "…" : rupiah(rataRataHarian)} icon="trending_up" />
        </div>

        <div className="lg:col-span-2 card p-space-md sm:p-space-lg flex flex-col">
          <h2 className="text-headline-md mb-space-md">Tren Pemasukan Harian</h2>

          {loading ? (
            <p className="text-body-sm text-tertiary py-space-xl text-center">Memuat grafik…</p>
          ) : belumAdaTransaksi ? (
            <EmptyState icon="show_chart" title="Belum ada transaksi" description={`Belum ada transaksi tercatat pada ${namaBulan(bulan)}.`} />
          ) : (
            <div className="flex-1 flex items-center">
              <LineChart data={chartData} formatValue={rupiahSingkat} />
            </div>
          )}
        </div>
      </div>

      {/* Tabel riwayat transaksi bulan berjalan */}
      <div className="card overflow-hidden">
        <div className="px-space-md py-space-md border-b border-border-subtle">
          <h2 className="text-headline-md">Riwayat Transaksi Bulan Ini</h2>
          <p className="text-label-sm text-tertiary capitalize">{namaBulan(bulan)}</p>
        </div>

        {loading ? (
          <p className="p-space-lg text-body-sm text-tertiary">Memuat data…</p>
        ) : transaksiBulanIni.length === 0 ? (
          <EmptyState icon="receipt_long" title="Belum ada transaksi" description={`Belum ada transaksi pada ${namaBulan(bulan)}.`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="bg-surface-canvas text-label-md text-tertiary">
                <tr>
                  <th className="text-left px-space-md py-3 font-semibold">No. Transaksi</th>
                  <th className="text-left px-space-md py-3 font-semibold">Tanggal</th>
                  <th className="text-left px-space-md py-3 font-semibold hidden md:table-cell">Item</th>
                  <th className="text-right px-space-md py-3 font-semibold">Total</th>
                  <th className="px-space-md py-3"></th>
                </tr>
              </thead>
              <tbody>
                {transaksiBulanIni.map((t) => (
                  <tr key={t.id} className="border-t border-border-subtle hover:bg-surface-canvas">
                    <td className="px-space-md py-3 font-semibold">{t.transactionNumber}</td>
                    <td className="px-space-md py-3 text-tertiary">
                      {new Date(t.createdAt).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "short" })} · {jam(t.createdAt)}
                    </td>
                    <td className="px-space-md py-3 text-tertiary hidden md:table-cell">
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