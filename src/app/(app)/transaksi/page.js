"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import MenuCard from "@/components/MenuCard";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import Receipt from "@/components/Receipt";
import { useToast } from "@/components/Toast";
import { rupiah } from "@/lib/format";

const NOMINAL_CEPAT = [5000, 10000, 20000, 50000, 100000];

export default function TransaksiPage() {
  const toast = useToast();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [cart, setCart] = useState([]);
  const [paid, setPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [struk, setStruk] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch("/api/menus")
      .then((r) => r.json())
      .then((d) => setMenus(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  const kategoriList = useMemo(
    () => ["Semua", ...Array.from(new Set(menus.map((m) => m.category)))],
    [menus]
  );

  const menusTampil = useMemo(
    () =>
      menus.filter(
        (m) =>
          (kategori === "Semua" || m.category === kategori) &&
          m.name.toLowerCase().includes(keyword.toLowerCase())
      ),
    [menus, kategori, keyword]
  );

  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const jumlahItem = cart.reduce((acc, i) => acc + i.quantity, 0);
  const paidNumber = Number(String(paid).replace(/\D/g, "")) || 0;
  const kembalian = paidNumber - total;

  const tambah = (menu) => {
    setCart((prev) => {
      const ada = prev.find((i) => i.menuId === menu.id);
      if (ada) return prev.map((i) => (i.menuId === menu.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { menuId: menu.id, name: menu.name, price: menu.price, quantity: 1, note: "" }];
    });
  };

  const ubahQty = (menuId, delta) =>
    setCart((prev) =>
      prev
        .map((i) => (i.menuId === menuId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );

  const hapusItem = (menuId) => setCart((prev) => prev.filter((i) => i.menuId !== menuId));

  const reset = () => { setCart([]); setPaid(""); };

  const simpan = async () => {
    if (cart.length === 0) return toast("Pilih minimal satu menu terlebih dahulu.", "error");
    if (paidNumber < total) return toast("Nominal pembayaran kurang dari total.", "error");

    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ menuId: i.menuId, quantity: i.quantity, note: i.note })),
          paidAmount: paidNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan transaksi.");

      setStruk(data.data);
      setCartOpen(false);
      reset();
      toast("Transaksi berhasil disimpan.");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Panel keranjang ---------------- */
  const CartBody = (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-space-md">
        {cart.length === 0 ? (
          <EmptyState icon="shopping_cart" title="Belum ada pesanan" description="Pilih menu untuk memulai transaksi." />
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle">
            {cart.map((item) => (
              <div key={item.menuId} className="py-space-md flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="min-w-0">
                    <p className="text-title-sm line-clamp-1">{item.name}</p>
                    <p className="text-label-sm text-tertiary">{rupiah(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-space-sm shrink-0">
                    <span className="text-title-sm">{rupiah(item.price * item.quantity)}</span>
                    <button onClick={() => hapusItem(item.menuId)} className="text-status-danger hover:bg-error-container rounded p-1" aria-label="Hapus item">
                      <Icon name="delete" size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm">
                  <div className="flex items-center border border-border-subtle rounded-full">
                    <button onClick={() => ubahQty(item.menuId, -1)} className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-canvas rounded-full" aria-label="Kurangi">
                      <Icon name="remove" size={18} />
                    </button>
                    <span className="w-8 text-center text-title-sm">{item.quantity}</span>
                    <button onClick={() => ubahQty(item.menuId, 1)} className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-canvas rounded-full" aria-label="Tambah">
                      <Icon name="add" size={18} />
                    </button>
                  </div>
                  <input
                    className="flex-1 h-9 px-3 bg-surface-canvas border border-border-subtle rounded-lg text-label-md
                               placeholder:text-tertiary focus:outline-none focus:border-primary-container"
                    placeholder="Catatan (mis. sambal dipisah)"
                    value={item.note}
                    onChange={(e) =>
                      setCart((prev) => prev.map((i) => (i.menuId === item.menuId ? { ...i, note: e.target.value } : i)))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border-subtle p-space-md flex flex-col gap-space-sm bg-surface-card">
        <div className="flex justify-between text-body-sm text-tertiary">
          <span>Jumlah item</span><span className="text-on-surface font-semibold">{jumlahItem}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-headline-md">Total</span>
          <span className="text-headline-md text-primary-container">{rupiah(total)}</span>
        </div>

        <div className="flex flex-col gap-1.5 mt-space-xs">
          <label className="text-label-md">Uang Pelanggan</label>
          <input
            inputMode="numeric"
            className="input-field"
            placeholder="0"
            value={paid ? Number(String(paid).replace(/\D/g, "")).toLocaleString("id-ID") : ""}
            onChange={(e) => setPaid(e.target.value.replace(/\D/g, ""))}
          />
          <div className="flex flex-wrap gap-space-xs mt-1">
            <button onClick={() => setPaid(String(total))} className="px-2.5 py-1 rounded-full border border-border-subtle text-label-sm hover:bg-surface-canvas">
              Uang Pas
            </button>
            {NOMINAL_CEPAT.map((n) => (
              <button key={n} onClick={() => setPaid(String(paidNumber + n))} className="px-2.5 py-1 rounded-full border border-border-subtle text-label-sm hover:bg-surface-canvas">
                +{n / 1000}rb
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-space-xs">
          <span className="text-body-sm text-tertiary">Kembalian</span>
          <span className={`text-title-sm ${kembalian < 0 ? "text-status-danger" : "text-status-success"}`}>
            {kembalian < 0 ? "Kurang " + rupiah(Math.abs(kembalian)) : rupiah(kembalian)}
          </span>
        </div>

        <button onClick={simpan} disabled={saving || cart.length === 0} className="btn-primary w-full h-12 mt-space-xs">
          <Icon name="point_of_sale" /> {saving ? "Menyimpan..." : "Bayar & Simpan"}
        </button>
        {cart.length > 0 && (
          <button onClick={reset} className="text-label-md text-tertiary hover:text-status-danger py-1">Kosongkan pesanan</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex">
      {/* Area menu */}
      <div className="flex-1 min-w-0 p-space-md sm:p-space-lg pb-28 xl:pb-space-lg flex flex-col gap-space-md no-print">
        <div>
          <h1 className="text-headline-lg tracking-tight">Transaksi</h1>
          <p className="text-body-sm text-tertiary">Pilih menu untuk membuat pesanan baru</p>
        </div>

        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            className="input-field pl-10"
            placeholder="Cari menu..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="flex gap-space-sm overflow-x-auto pb-1">
          {kategoriList.map((k) => (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className={`px-space-md py-2 rounded-full text-label-md whitespace-nowrap border transition-colors ${
                kategori === k
                  ? "bg-primary-container text-white border-primary-container font-semibold"
                  : "bg-surface-card text-tertiary border-border-subtle hover:bg-surface-canvas"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-body-sm text-tertiary">Memuat menu…</p>
        ) : menusTampil.length === 0 ? (
          <EmptyState icon="search_off" title="Menu tidak ditemukan" description="Coba kata kunci atau kategori lain." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-space-sm sm:gap-space-md">
            {menusTampil.map((m) => (
              <MenuCard key={m.id} menu={m} onAdd={tambah} qty={cart.find((i) => i.menuId === m.id)?.quantity || 0} />
            ))}
          </div>
        )}
      </div>

      {/* Panel keranjang desktop */}
      <aside className="hidden xl:flex flex-col w-[380px] shrink-0 border-l border-border-subtle bg-surface-card
                        sticky top-16 h-[calc(100vh-4rem)] overflow-hidden no-print">
        <div className="shrink-0 px-space-md py-space-md border-b border-border-subtle">
          <h2 className="text-headline-md">Pesanan Aktif</h2>
          <p className="text-label-sm text-tertiary">Nomor transaksi dibuat otomatis saat disimpan</p>
        </div>
        {CartBody}
      </aside>

      {/* Bar keranjang mobile */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 no-print"
           style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <button
          onClick={() => setCartOpen(true)}
          className="w-full bg-primary-container text-white flex items-center justify-between px-space-lg py-4 shadow-lg"
        >
          <span className="flex items-center gap-space-sm">
            <Icon name="shopping_cart" />
            <span className="text-title-sm">{jumlahItem} item</span>
          </span>
          <span className="flex items-center gap-space-xs text-title-sm">
            {rupiah(total)} <Icon name="expand_less" />
          </span>
        </button>
      </div>

      {/* Sheet keranjang mobile */}
      {cartOpen && (
        <div className="xl:hidden fixed inset-0 z-[80] flex flex-col justify-end no-print">
          <div className="absolute inset-0 bg-[rgba(31,41,55,0.45)]" onClick={() => setCartOpen(false)} />
          <div className="relative bg-surface-card rounded-t-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between px-space-md py-space-md border-b border-border-subtle">
              <h2 className="text-headline-md">Pesanan Aktif</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 text-tertiary" aria-label="Tutup">
                <Icon name="close" />
              </button>
            </div>
            {CartBody}
          </div>
        </div>
      )}

      {/* Modal struk */}
      <Modal
        open={!!struk}
        title="Transaksi Berhasil"
        onClose={() => setStruk(null)}
        footer={
          <>
            <button className="btn-outline" onClick={() => window.print()}>
              <Icon name="print" /> Cetak Struk
            </button>
            <button className="btn-primary" onClick={() => setStruk(null)}>
              <Icon name="add" /> Transaksi Baru
            </button>
          </>
        }
      >
        <Receipt trx={struk} />
        {struk && (
          <p className="text-center mt-space-md text-label-md">
            <Link href={`/riwayat/${struk.id}`} className="text-primary-container font-semibold hover:underline">
              Lihat detail transaksi
            </Link>
          </p>
        )}
      </Modal>
    </div>
  );
}