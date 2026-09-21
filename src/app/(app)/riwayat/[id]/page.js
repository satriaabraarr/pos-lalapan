"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Icon from "@/components/Icon";
import Receipt from "@/components/Receipt";
import { rupiah, tanggalLengkap } from "@/lib/format";

export default function DetailTransaksiPage() {
  const { id } = useParams();
  const [trx, setTrx] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/transactions/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.message);
        setTrx(d.data);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="p-space-lg text-body-md text-status-danger">{error}</div>;
  if (!trx) return <div className="p-space-lg text-body-sm text-tertiary">Memuat transaksi…</div>;

  return (
    <div className="p-space-md sm:p-space-lg max-w-5xl mx-auto w-full flex flex-col gap-space-lg">
      <div className="flex items-center gap-space-sm no-print">
        <Link href="/riwayat" className="p-2 rounded-lg hover:bg-surface-card text-tertiary" aria-label="Kembali">
          <Icon name="arrow_back" />
        </Link>
        <div>
          <h1 className="text-headline-lg tracking-tight">Detail Transaksi</h1>
          <p className="text-body-sm text-tertiary">{trx.transactionNumber}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-space-lg">
        {/* Rincian */}
        <div className="lg:col-span-3 card overflow-hidden no-print">
          <div className="px-space-md py-space-md border-b border-border-subtle">
            <h2 className="text-headline-md">Rincian Pesanan</h2>
            <p className="text-label-sm text-tertiary">{tanggalLengkap(trx.createdAt)}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="bg-surface-canvas text-label-md text-tertiary">
                <tr>
                  <th className="text-left px-space-md py-3 font-semibold">Menu</th>
                  <th className="text-right px-space-md py-3 font-semibold">Harga</th>
                  <th className="text-center px-space-md py-3 font-semibold">Qty</th>
                  <th className="text-right px-space-md py-3 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {trx.items.map((i) => (
                  <tr key={i.id} className="border-t border-border-subtle">
                    <td className="px-space-md py-3">
                      <p className="font-semibold">{i.menuName}</p>
                      {i.note && <p className="text-label-sm text-tertiary italic">{i.note}</p>}
                    </td>
                    <td className="px-space-md py-3 text-right text-tertiary">{rupiah(i.price)}</td>
                    <td className="px-space-md py-3 text-center">{i.quantity}</td>
                    <td className="px-space-md py-3 text-right font-semibold">{rupiah(i.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-space-md py-space-md border-t border-border-subtle flex flex-col gap-1.5">
            <div className="flex justify-between text-headline-md">
              <span>Total</span><span className="text-primary-container">{rupiah(trx.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-body-sm text-tertiary"><span>Dibayar</span><span className="text-on-surface">{rupiah(trx.paidAmount)}</span></div>
            <div className="flex justify-between text-body-sm text-tertiary"><span>Kembalian</span><span className="text-on-surface font-semibold">{rupiah(trx.changeAmount)}</span></div>
          </div>
        </div>

        {/* Struk */}
        <div className="lg:col-span-2 flex flex-col gap-space-md">
          <Receipt trx={trx} />
          <div className="flex gap-space-sm no-print">
            <button className="btn-outline flex-1" onClick={() => window.print()}><Icon name="print" /> Cetak Struk</button>
            <Link href="/transaksi" className="btn-primary flex-1"><Icon name="add" /> Transaksi Baru</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
