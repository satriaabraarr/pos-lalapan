/**
 * Membuat rentang waktu 00:00:00 - 23:59:59 untuk sebuah tanggal
 * pada zona waktu Asia/Jakarta (WIB, UTC+7).
 */
export function rentangHarian(tanggal) {
  const dateStr = tanggal || new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
  const start = new Date(`${dateStr}T00:00:00.000+07:00`);
  const end = new Date(`${dateStr}T23:59:59.999+07:00`);
  return { dateStr, start, end };
}

/**
 * Membuat rentang waktu 1 bulan penuh (tanggal 1 pukul 00:00:00 - tanggal
 * terakhir pukul 23:59:59) pada zona waktu Asia/Jakarta.
 * @param {string} bulan Format "YYYY-MM". Kosongkan untuk bulan berjalan.
 */
export function rentangBulanan(bulan) {
  const iniStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }).slice(0, 7);
  const [yearStr, monthStr] = (bulan || iniStr).split("-");
  const year = Number(yearStr);
  const month = Number(monthStr); // 1-12

  const daysInMonth = new Date(year, month, 0).getDate();
  const start = new Date(`${yearStr}-${monthStr}-01T00:00:00.000+07:00`);
  const end = new Date(`${yearStr}-${monthStr}-${String(daysInMonth).padStart(2, "0")}T23:59:59.999+07:00`);

  return { year, month, daysInMonth, bulanStr: `${yearStr}-${monthStr}`, start, end };
}