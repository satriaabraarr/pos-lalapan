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
