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
