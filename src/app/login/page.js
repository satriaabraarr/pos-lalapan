"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal masuk.");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel kiri (branding) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-container p-space-xl text-white">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon name="restaurant" size={24} />
          </div>
          <span className="text-headline-md font-bold">POS Lalapan</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-[34px] leading-[42px] font-bold">Kasir warung jadi rapi, cepat, dan tercatat.</h1>
          <p className="mt-space-md text-white/90 text-body-md">
            Catat transaksi, cetak struk, pantau pemasukan harian, dan kelola menu dari satu aplikasi.
          </p>
        </div>
        <p className="text-label-sm text-white/70">© {new Date().getFullYear()} POS Lalapan</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-space-lg bg-surface-canvas">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-space-sm mb-space-lg">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white">
              <Icon name="restaurant" size={24} />
            </div>
            <span className="text-headline-md font-bold">POS Lalapan</span>
          </div>

          <h2 className="text-headline-lg">Masuk</h2>
          <p className="text-body-sm text-tertiary mt-1">Gunakan akun kasir atau pemilik warung.</p>

          <form onSubmit={submit} className="mt-space-lg flex flex-col gap-space-md">
            {error && (
              <div className="flex items-start gap-space-sm bg-error-container text-on-error-container px-space-md py-3 rounded-lg text-body-sm">
                <Icon name="error" size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md text-on-surface" htmlFor="email">Email</label>
              <input
                id="email" type="email" autoComplete="email" className="input-field"
                placeholder="Masukkan Email Anda"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md text-on-surface" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPass ? "text" : "password"} autoComplete="current-password"
                  className="input-field pr-11" placeholder="Masukkan Password Anda"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-on-surface"
                  aria-label="Tampilkan password"
                >
                  <Icon name={showPass ? "visibility_off" : "visibility"} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary h-11 w-full mt-space-xs" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
