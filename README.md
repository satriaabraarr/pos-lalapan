# LalapanKu POS — Sistem Kasir Warung Lalapan

Implementasi penuh dari PRD "Sistem Kasir Warung Lalapan" dengan gaya visual mengikuti
desain Stitch yang diberikan (primary `#F97316`, font Inter, Material Symbols, layout
sidebar 240px + topbar 64px + panel keranjang 380px).

**Stack:** Next.js 14 (App Router) · Node.js (Route Handlers) · PostgreSQL + Prisma · JWT httpOnly cookie · Tailwind CSS
**Deploy:** Vercel (web) · Electron (mode desktop)

---

## 1. Yang dibutuhkan

| Kebutuhan | Versi minimal | Cek dengan |
|---|---|---|
| Node.js | 18.18+ (disarankan 20 LTS) | `node -v` |
| npm | 9+ | `npm -v` |
| PostgreSQL | 14+ (lokal) atau Neon/Supabase (cloud) | `psql --version` |
| Git | bebas | `git --version` |

---

## 2. Langkah instalasi (lokal)

```bash
# 1) Masuk ke folder project
cd lalapanku-pos

# 2) Install dependency
npm install

# 3) Siapkan environment
cp .env.example .env
#    lalu edit .env -> isi DATABASE_URL dan JWT_SECRET

# 4) Buat tabel di database
npm run db:push

# 5) Isi data awal (2 akun + 12 menu contoh)
npm run db:seed

# 6) Jalankan
npm run dev
```

Buka **http://localhost:3000**

**Akun demo**
- Kasir: `kasir@lalapanku.id` / `password123`
- Pemilik: `pemilik@lalapanku.id` / `password123`

### Membuat database lokal

```bash
# masuk ke psql
psql -U postgres
CREATE DATABASE lalapanku;
\q
```

Lalu isi `.env`:

```env
DATABASE_URL="postgresql://postgres:PASSWORDMU@localhost:5432/lalapanku?schema=public"
JWT_SECRET="acak-panjang-minimal-32-karakter-ya-jangan-lupa"
```

Untuk `JWT_SECRET` acak: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 3. Mode desktop

Aplikasi yang sama bisa dijalankan sebagai jendela desktop (Electron):

```bash
npm run desktop          # dev: Next.js + jendela Electron sekaligus
npm run desktop:build    # opsional: bikin installer .exe/.dmg/.AppImage
```

Untuk komputer kasir yang menunjuk ke server lain:
`APP_URL=http://192.168.1.10:3000 npm run desktop`

---

## 4. Deploy ke Vercel

1. Push project ke GitHub.
2. Buat database PostgreSQL cloud (Neon / Supabase / Vercel Postgres) → salin connection string.
3. Di Vercel: **New Project** → import repo.
4. Tambahkan Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_STORE_ADDRESS`, `NEXT_PUBLIC_STORE_PHONE`.
5. Deploy. Script `build` sudah menjalankan `prisma generate` otomatis.
6. Sekali saja setelah deploy pertama, dari komputermu (dengan `.env` diarahkan ke DB produksi):
   `npm run db:push && npm run db:seed`

---

## 5. Struktur folder

```
prisma/
  schema.prisma          # 4 tabel: users, menus, transactions, transaction_items
  seed.mjs               # akun + menu contoh
src/
  middleware.js          # proteksi halaman privat (redirect ke /login)
  lib/
    prisma.js            # singleton Prisma Client
    auth.js              # JWT (jose) + cookie httpOnly
    format.js            # rupiah(), tanggal, jam, hariIni()
    date-range.js        # rentang harian zona Asia/Jakarta
    validasi.js          # validasi payload menu
  components/            # Sidebar, Topbar, MenuCard, Modal, ConfirmDialog,
                         # Toast, StatCard, EmptyState, Receipt, Icon
  app/
    login/page.js
    (app)/layout.js      # shell: sidebar + topbar (responsive)
    (app)/dashboard/page.js
    (app)/transaksi/page.js
    (app)/riwayat/page.js
    (app)/riwayat/[id]/page.js
    (app)/menu/page.js
    api/login | logout | me
    api/menus | menus/[id]
    api/transactions | transactions/[id]
    api/reports/daily
electron/main.js         # pembungkus desktop
```

---

## 6. Daftar REST API

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/login` | Login, set cookie JWT |
| POST | `/api/logout` | Hapus cookie |
| GET | `/api/me` | Data user aktif |
| GET | `/api/menus?q=&category=&available=1` | Daftar menu |
| POST | `/api/menus` | Tambah menu |
| PUT | `/api/menus/:id` | Edit menu / toggle status |
| DELETE | `/api/menus/:id` | Hapus menu |
| GET | `/api/transactions?date=YYYY-MM-DD&q=` | Riwayat + ringkasan pemasukan |
| POST | `/api/transactions` | Simpan transaksi baru |
| GET | `/api/transactions/:id` | Detail transaksi (untuk struk) |
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Pemasukan harian + transaksi terbaru |

Semua endpoint selain `/api/login` butuh cookie JWT yang valid.

---

## 7. Catatan teknis penting

- **Harga dihitung ulang di server.** Client hanya mengirim `menuId`, `quantity`, dan `paidAmount`. Server mengambil harga terbaru dari DB, menolak menu yang tidak tersedia, menolak pembayaran kurang dari total, lalu menyimpan snapshot `menu_name` + `price` ke `transaction_items` — jadi perubahan harga menu tidak mengubah transaksi lama (sesuai Acceptance Criteria PRD).
- **Nomor transaksi** otomatis: `TRX-YYYYMMDD-0001`, urut per hari, kolom `unique`.
- **Zona waktu** perhitungan pemasukan harian dikunci ke `Asia/Jakarta` (WIB), bukan UTC server.
- **Cetak struk** memakai `window.print()` + CSS `@media print` dengan lebar 80mm (siap untuk printer thermal).
- **Password** di-hash dengan bcrypt, cookie `httpOnly` + `secure` di produksi.
- **Responsive**: desktop (sidebar + panel keranjang menempel), tablet, dan mobile (sidebar jadi drawer, keranjang jadi bottom sheet).

---

## 8. Ide pengembangan lanjutan (dari PRD bagian 13)

Laporan mingguan/bulanan, grafik penjualan, manajemen stok, menu terlaris,
role pemilik vs kasir yang benar-benar dibatasi, export Excel/PDF, integrasi printer thermal (ESC/POS).
