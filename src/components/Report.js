"use client";
import { rupiah, jam } from "@/lib/format";

// Path SVG ikon "restaurant" (Material Symbols) — sama persis dengan yang dipakai
// di sidebar (Icon name="restaurant") dan di src/app/icon.svg, supaya konsisten.
const PATH_IKON_RESTORAN =
  "M7 22v-9.15q-1.275-.35-2.137-1.4Q4 10.4 4 9V2h2v7h1V2h2v7h1V2h2v7q0 1.4-.863 2.45-.862 1.05-2.137 1.4V22Zm10 0v-8h-3V7q0-2.075 1.463-3.537Q16.925 2 19 2v20Z";

function namaBulan(bulanStr) {
  const [y, m] = bulanStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

/**
 * Template dokumen "Laporan Pemasukan Bulanan" — hanya dirender saat Export PDF
 * (dibungkus `hidden print:block` oleh pemanggilnya), tidak pernah tampil di layar biasa.
 *
 * props:
 * - bulan: string "YYYY-MM"
 * - data: hasil GET /api/reports/monthly (totalPemasukan, jumlahTransaksi, harian, transaksi)
 */
export default function LaporanCetak({ bulan, data }) {
  if (!data) return null;

  const rataRataHarian = data.daysInMonth ? Math.round(data.totalPemasukan / data.daysInMonth) : 0;
  const transaksi = data.transaksi || [];

  return (
    <div className="bg-white text-black">
      {/* Logo + nama aplikasi */}
      <div className="flex items-center gap-space-sm mb-space-sm">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#F97316" }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFFFFF">
            <path d={PATH_IKON_RESTORAN} />
          </svg>
        </div>
        <p className="text-xl font-bold leading-none">
          <span style={{ color: "#f97316" }}>POS</span> <span className="text-black">Lalapan</span>
        </p>
      </div>

      {/* Subjudul */}
      <p className="text-sm font-semibold mb-space-sm">
        Laporan Pemasukan Bulanan - Periode <span className="capitalize">{namaBulan(bulan)}</span>
      </p>

      {/* Garis pembatas */}
      <hr className="border-t-2 border-black mb-space-md border-double" />

      {/* Tiga kotak ringkasan */}
      <div className="grid grid-cols-3 gap-space-sm mb-space-lg">
        <div className="border border-black rounded px-space-sm py-space-sm text-center" style={{ backgroundColor: "#FFF1E6" }}>
          <p className="text-xs text-gray-700">Total Pemasukan</p>
          <p className="text-sm font-bold mt-0.5">{rupiah(data.totalPemasukan)}</p>
        </div>
        <div className="border border-black rounded px-space-sm py-space-sm text-center" style={{ backgroundColor: "#FFF1E6" }}>
          <p className="text-xs text-gray-700">Jumlah Transaksi</p>
          <p className="text-sm font-bold mt-0.5">{data.jumlahTransaksi} transaksi</p>
        </div>
        <div className="border border-black rounded px-space-sm py-space-sm text-center" style={{ backgroundColor: "#FFF1E6" }}>
          <p className="text-xs text-gray-700">Rata-rata per Hari</p>
          <p className="text-sm font-bold mt-0.5">{rupiah(rataRataHarian)}</p>
        </div>
      </div>

      {/* Rincian transaksi */}
      <p className="text-sm font-bold mb-space-xs">Rincian Transaksi</p>
      {transaksi.length === 0 ? (
        <p className="text-xs mb-space-lg">Tidak ada transaksi pada bulan ini.</p>
      ) : (
        <table className="w-full text-xs border border-collapse border-black mb-space-lg">
          <thead>
            <tr style={{ backgroundColor: "#F97316" }} className="text-white">
              <th className="border border-black px-space-sm py-1 text-center w-8">No</th>
              <th className="border border-black px-space-sm py-1 text-left">No. Transaksi</th>
              <th className="border border-black px-space-sm py-1 text-left">Tanggal</th>
              <th className="border border-black px-space-sm py-1 text-center">Waktu</th>
              <th className="border border-black px-space-sm py-1 text-center">Item</th>
              <th className="border border-black px-space-sm py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((t, i) => (
              <tr key={t.id}>
                <td className="border border-black px-space-sm py-1 text-center">{i + 1}</td>
                <td className="border border-black px-space-sm py-1">{t.transactionNumber}</td>
                <td className="border border-black px-space-sm py-1">
                  {new Date(t.createdAt).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "numeric" })}
                </td>
                <td className="border border-black px-space-sm py-1 text-center">{jam(t.createdAt)}</td>
                <td className="border border-black px-space-sm py-1 text-center">{t.items.reduce((a, i2) => a + i2.quantity, 0)}</td>
                <td className="border border-black px-space-sm py-1 text-right">{rupiah(t.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#F97316" }} className="text-white">
              <td colSpan={5} className="border border-black px-space-sm py-1.5 text-right font-bold">
                Total Pemasukan
              </td>
              <td className="border border-black px-space-sm py-1.5 text-right font-bold">{rupiah(data.totalPemasukan)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      {/* Tanggal cetak */}
      <p className="text-xs">
        Dicetak pada{" "}
        {new Date().toLocaleDateString("id-ID", {
          timeZone: "Asia/Jakarta", day: "2-digit", month: "long", year: "numeric",
        })}
      </p>
    </div>
  );
}