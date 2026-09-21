"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import { rupiah, jam, hariIni } from "@/lib/format";

export default function RiwayatPage() {
  const [tanggal, setTanggal] = useState(hariIni());
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState({ data: [], summary: { totalPemasukan: 0, jumlahTransaksi: 0 } });
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tanggal) params.set("date", tanggal);
    if (keyword.trim()) params.set("q", keyword.trim());
    const res = await fetch(`/api/transactions?${params}`);
    setData(await res.json());
    setLoading(false);
  }, [tanggal, keyword]);

  useEffect(() => {
    const t = setTimeout(muat, 250);
    return () => clearTimeout(t);
  }, [muat]);

  return (
    <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-headline-lg tracking-tight">Riwayat Transaksi</h1>
        <p className="text-body-sm text-tertiary">Lihat transaksi dan pemasukan berdasarkan tanggal</p>
      </div>

      <div className="card p-space-md flex flex-col lg:flex-row lg:items-end gap-space-md">
        <div className="flex flex-col gap-1.5 lg:w-56">
          <label className="text-label-md">Tanggal</label>
          <input type="date" className="input-field" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-label-md">Cari Nomor Transaksi</label>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
            <input className="input-field pl-10" placeholder="TRX-..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-space-sm">
          <button className="btn-outline h-11" onClick={() => setTanggal(hariIni())}>Hari Ini</button>
          <button className="btn-outline h-11" onClick={() => { setTanggal(""); setKeyword(""); }}>Semua</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <div className="card p-space-md">
          <p className="text-label-md text-tertiary">Total Pemasukan {tanggal ? `(${tanggal})` : "(semua tanggal)"}</p>
          <p className="text-display-stat text-primary-container mt-1">{rupiah(data.summary?.totalPemasukan)}</p>
        </div>
        <div className="card p-space-md">
          <p className="text-label-md text-tertiary">Jumlah Transaksi</p>
          <p className="text-display-stat mt-1">{data.summary?.jumlahTransaksi ?? 0}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-space-lg text-body-sm text-tertiary">Memuat data…</p>
        ) : data.data.length === 0 ? (
          <EmptyState icon="receipt_long" title="Tidak ada transaksi" description="Belum ada transaksi pada filter yang dipilih." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="bg-surface-canvas text-label-md text-tertiary">
                <tr>
                  <th className="text-left px-space-md py-3 font-semibold">No. Transaksi</th>
                  <th className="text-left px-space-md py-3 font-semibold">Waktu</th>
                  <th className="text-left px-space-md py-3 font-semibold hidden md:table-cell">Item</th>
                  <th className="text-right px-space-md py-3 font-semibold">Total</th>
                  <th className="text-center px-space-md py-3 font-semibold hidden sm:table-cell">Status</th>
                  <th className="px-space-md py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((t) => (
                  <tr key={t.id} className="border-t border-border-subtle hover:bg-surface-canvas">
                    <td className="px-space-md py-3 font-semibold">{t.transactionNumber}</td>
                    <td className="px-space-md py-3 text-tertiary">
                      {new Date(t.createdAt).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })} · {jam(t.createdAt)}
                    </td>
                    <td className="px-space-md py-3 text-tertiary hidden md:table-cell">
                      {t.items.reduce((a, i) => a + i.quantity, 0)} item
                    </td>
                    <td className="px-space-md py-3 text-right font-semibold">{rupiah(t.totalAmount)}</td>
                    <td className="px-space-md py-3 text-center hidden sm:table-cell"><span className="badge-success">Lunas</span></td>
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
