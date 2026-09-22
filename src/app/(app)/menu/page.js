"use client";
import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import { rupiah } from "@/lib/format";

const KOSONG = { name: "", category: "Makanan", price: "", description: "", imageUrl: "", isAvailable: true };

export default function ManajemenMenuPage() {
  const toast = useToast();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(KOSONG);
  const [formError, setFormError] = useState("");
  const [hapus, setHapus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const muat = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/menus?q=${encodeURIComponent(keyword)}`);
    const d = await res.json();
    setMenus(d.data || []);
    setLoading(false);
  }, [keyword]);

  useEffect(() => {
    const t = setTimeout(muat, 250);
    return () => clearTimeout(t);
  }, [muat]);

  const bukaTambah = () => { setEditing(null); setForm(KOSONG); setFormError(""); setFormOpen(true); };

  const bukaEdit = (menu) => {
    setEditing(menu);
    setForm({
      name: menu.name, category: menu.category, price: String(menu.price),
      description: menu.description || "", imageUrl: menu.imageUrl || "", isAvailable: menu.isAvailable,
    });
    setFormError("");
    setFormOpen(true);
  };

  const simpan = async () => {
    setFormError("");
    if (!form.name.trim()) return setFormError("Nama menu wajib diisi.");
    if (!form.category.trim()) return setFormError("Kategori wajib diisi.");
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0)
      return setFormError("Harga harus berupa angka dan tidak boleh negatif.");

    setSaving(true);
    try {
      const url = editing ? `/api/menus/${editing.id}` : "/api/menus";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast(d.message);
      setFormOpen(false);
      muat();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (menu) => {
    const res = await fetch(`/api/menus/${menu.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !menu.isAvailable }),
    });
    if (res.ok) {
      setMenus((prev) => prev.map((m) => (m.id === menu.id ? { ...m, isAvailable: !m.isAvailable } : m)));
      toast(`"${menu.name}" ditandai ${menu.isAvailable ? "tidak tersedia" : "tersedia"}.`);
    } else {
      toast("Gagal mengubah status menu.", "error");
    }
  };

  const konfirmasiHapus = async () => {
    const res = await fetch(`/api/menus/${hapus.id}`, { method: "DELETE" });
    const d = await res.json();
    if (res.ok) { toast(d.message); muat(); } else { toast(d.message, "error"); }
    setHapus(null);
  };

  const pindahUrutan = async (index, arah) => {
    const target = index + arah;
    if (target < 0 || target >= menus.length) return;

    // Tukar tampilan dulu supaya terasa instan
    const menusBaru = [...menus];
    [menusBaru[index], menusBaru[target]] = [menusBaru[target], menusBaru[index]];
    setMenus(menusBaru);

    // Nomori ulang SELURUH daftar sesuai posisi barunya (0, 1, 2, ...).
    // Ini penting: kalau cuma menukar nilai order dua item, menu yang
    // order-nya masih sama-sama 0 (belum pernah diurutkan) tidak akan berubah.
    try {
      const hasil = await Promise.all(
        menusBaru.map((m, i) =>
          fetch(`/api/menus/${m.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: i }),
          })
        )
      );
      if (hasil.some((r) => !r.ok)) throw new Error();
    } catch {
      toast("Gagal menyimpan urutan menu.", "error");
      muat(); // rollback ke urutan server
    }
  };

  const unggahFoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("File harus berupa gambar.", "error");
    if (file.size > 2 * 1024 * 1024) return toast("Ukuran gambar maksimal 2MB.", "error");

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setForm((f) => ({ ...f, imageUrl: d.url }));
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="text-headline-lg tracking-tight">Manajemen Menu</h1>
          <p className="text-body-sm text-tertiary">Kelola daftar menu, harga, dan ketersediaan</p>
        </div>
        <button className="btn-primary" onClick={bukaTambah}><Icon name="add" /> Tambah Menu</button>
      </div>

      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
        <input className="input-field pl-10 max-w-md" placeholder="Cari menu..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </div>
      {keyword.trim() && (
        <p className="text-label-sm text-tertiary -mt-space-sm">Kosongkan pencarian untuk mengatur urutan tampil menu.</p>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-space-lg text-body-sm text-tertiary">Memuat menu…</p>
        ) : menus.length === 0 ? (
          <EmptyState
            icon="restaurant_menu" title="Belum ada menu" description="Tambahkan menu makanan atau minuman warung."
            action={<button className="btn-primary mt-space-sm" onClick={bukaTambah}><Icon name="add" /> Tambah Menu</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead className="bg-surface-canvas text-label-md text-tertiary">
                <tr>
                  <th className="text-left px-space-md py-3 font-semibold w-16">Urutan</th>
                  <th className="text-left px-space-md py-3 font-semibold">Nama Menu</th>
                  <th className="text-left px-space-md py-3 font-semibold hidden sm:table-cell">Kategori</th>
                  <th className="text-right px-space-md py-3 font-semibold">Harga</th>
                  <th className="text-center px-space-md py-3 font-semibold">Status</th>
                  <th className="text-right px-space-md py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((m, index) => (
                  <tr key={m.id} className="border-t border-border-subtle hover:bg-surface-canvas">
                    <td className="px-space-md py-3">
                      <div className="flex flex-col">
                        <button
                          onClick={() => pindahUrutan(index, -1)}
                          disabled={!!keyword.trim() || index === 0}
                          className="p-0.5 rounded text-tertiary hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Pindah ke atas"
                        >
                          <Icon name="arrow_upward" size={16} />
                        </button>
                        <button
                          onClick={() => pindahUrutan(index, 1)}
                          disabled={!!keyword.trim() || index === menus.length - 1}
                          className="p-0.5 rounded text-tertiary hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Pindah ke bawah"
                        >
                          <Icon name="arrow_downward" size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-space-md py-3">
                      <p className="font-semibold">{m.name}</p>
                      {m.description && <p className="text-label-sm text-tertiary line-clamp-1">{m.description}</p>}
                      <p className="text-label-sm text-tertiary sm:hidden">{m.category}</p>
                    </td>
                    <td className="px-space-md py-3 text-tertiary hidden sm:table-cell">{m.category}</td>
                    <td className="px-space-md py-3 text-right font-semibold">{rupiah(m.price)}</td>
                    <td className="px-space-md py-3 text-center">
                      <button onClick={() => toggleStatus(m)} className={m.isAvailable ? "badge-success" : "badge-muted"}>
                        {m.isAvailable ? "Tersedia" : "Tidak Tersedia"}
                      </button>
                    </td>
                    <td className="px-space-md py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => bukaEdit(m)} className="p-2 rounded-lg text-tertiary hover:bg-surface-container-low hover:text-on-surface" aria-label="Edit">
                          <Icon name="edit" size={18} />
                        </button>
                        <button onClick={() => setHapus(m)} className="p-2 rounded-lg text-status-danger hover:bg-error-container" aria-label="Hapus">
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form tambah/edit */}
      <Modal
        open={formOpen}
        title={editing ? "Edit Menu" : "Tambah Menu"}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button className="btn-outline" onClick={() => setFormOpen(false)}>Batal</button>
            <button className="btn-primary" onClick={simpan} disabled={saving || uploading}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </>
        }
      >
        <div className="flex flex-col gap-space-md">
          {formError && (
            <div className="bg-error-container text-on-error-container px-space-md py-3 rounded-lg text-body-sm">{formError}</div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md">Nama Menu *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ayam Lalapan" />
          </div>

          <div className="grid sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">Kategori *</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Makanan</option>
                <option>Minuman</option>
                <option>Tambahan</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md">Harga (Rp) *</label>
              <input inputMode="numeric" className="input-field" value={form.price}
                     onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })} placeholder="18000" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md">Deskripsi</label>
            <textarea className="input-field h-20 py-2 resize-none" value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Keterangan singkat menu" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-md">Foto Menu (opsional)</label>

            {form.imageUrl ? (
              <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-border-subtle group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="Pratinjau" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: "" })}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-status-danger"
                  aria-label="Hapus foto"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-1 w-28 h-28 rounded-lg border-2 border-dashed
                           border-border-subtle text-tertiary cursor-pointer hover:border-primary-container hover:text-primary-container
                           transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}
              >
                <Icon name={uploading ? "progress_activity" : "add_a_photo"} size={22} className={uploading ? "animate-spin" : ""} />
                <span className="text-label-sm">{uploading ? "Mengunggah..." : "Unggah Foto"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => unggahFoto(e.target.files?.[0])}
                  disabled={uploading}
                />
              </label>
            )}
            <span className="text-label-sm text-tertiary">JPG, PNG, WEBP, atau GIF. Maksimal 2MB.</span>
          </div>

          <label className="flex items-center gap-space-sm cursor-pointer">
            <input type="checkbox" className="w-5 h-5 accent-[#f97316]" checked={form.isAvailable}
                   onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
            <span className="text-body-sm">Menu tersedia untuk dijual</span>
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!hapus}
        title="Hapus Menu"
        message={`Yakin ingin menghapus "${hapus?.name}"? Transaksi lama tidak terpengaruh karena harga dan nama menu sudah tersimpan di setiap transaksi.`}
        onCancel={() => setHapus(null)}
        onConfirm={konfirmasiHapus}
      />
    </div>
  );
}