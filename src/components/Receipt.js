"use client";
import { rupiah, tanggalLengkap } from "@/lib/format";

const NAMA = process.env.NEXT_PUBLIC_STORE_NAME || "POS Lalapan";
const ALAMAT = process.env.NEXT_PUBLIC_STORE_ADDRESS || "";
const TELEPON = process.env.NEXT_PUBLIC_STORE_PHONE || "";

export default function Receipt({ trx }) {
  if (!trx) return null;

  return (
    <div id="area-struk" className="bg-surface-card w-full max-w-[360px] mx-auto p-space-md rounded-lg border border-border-subtle">
      <div className="text-center border-b border-dashed border-border-subtle pb-space-sm">
        <p className="text-title-sm font-bold uppercase tracking-wide">{NAMA}</p>
        {ALAMAT && <p className="text-label-sm text-tertiary mt-0.5">{ALAMAT}</p>}
        {TELEPON && <p className="text-label-sm text-tertiary">{TELEPON}</p>}
      </div>

      <div className="py-space-sm text-receipt-mono border-b border-dashed border-border-subtle">
        <div className="flex justify-between"><span className="text-tertiary">No. Transaksi</span><span className="font-semibold">{trx.transactionNumber}</span></div>
        <div className="flex justify-between"><span className="text-tertiary">Waktu</span><span>{tanggalLengkap(trx.createdAt)}</span></div>
        {trx.cashierName && (
          <div className="flex justify-between"><span className="text-tertiary">Kasir</span><span>{trx.cashierName}</span></div>
        )}
      </div>

      <div className="py-space-sm border-b border-dashed border-border-subtle flex flex-col gap-space-sm">
        {trx.items.map((item) => (
          <div key={item.id ?? item.menuName} className="text-receipt-mono">
            <p className="font-semibold">{item.menuName}</p>
            <div className="flex justify-between text-tertiary">
              <span>{item.quantity} x {rupiah(item.price)}</span>
              <span className="text-on-surface font-semibold">{rupiah(item.subtotal)}</span>
            </div>
            {item.note && <p className="text-label-sm text-tertiary italic">Catatan: {item.note}</p>}
          </div>
        ))}
      </div>

      <div className="py-space-sm flex flex-col gap-1 text-receipt-mono">
        <div className="flex justify-between text-title-sm">
          <span>TOTAL</span><span className="text-primary-container">{rupiah(trx.totalAmount)}</span>
        </div>
        <div className="flex justify-between"><span className="text-tertiary">Tunai</span><span>{rupiah(trx.paidAmount)}</span></div>
        <div className="flex justify-between"><span className="text-tertiary">Kembalian</span><span className="font-semibold">{rupiah(trx.changeAmount)}</span></div>
      </div>

      <p className="text-center text-label-sm text-tertiary border-t border-dashed border-border-subtle pt-space-sm">
        Terima kasih atas kunjungan Anda 🙏
      </p>
    </div>
  );
}
