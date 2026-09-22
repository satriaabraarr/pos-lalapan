export function rupiah(value) {
  const n = Number(value || 0);
  return "Rp" + n.toLocaleString("id-ID");
}

export function tanggalLengkap(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
  });
}

export function jam(iso) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
  });
}

/** Tanggal hari ini dalam format YYYY-MM-DD zona Asia/Jakarta. */
export function hariIni() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
}

/** Format ringkas untuk label grafik: Rp15rb, Rp1.2jt, dsb. */
export function rupiahSingkat(value) {
  const n = Number(value || 0);
  if (n >= 1_000_000) {
    const jt = n / 1_000_000;
    return `Rp${jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1)}jt`;
  }
  if (n >= 1_000) return `Rp${Math.round(n / 1000)}rb`;
  return `Rp${n}`;
}