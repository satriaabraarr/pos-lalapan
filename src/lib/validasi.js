/** Validasi payload menu (dipakai oleh POST /api/menus dan PUT /api/menus/:id). */
export function validasiMenu(body) {
  if (!body?.name?.trim()) return "Nama menu wajib diisi.";
  if (!body?.category?.trim()) return "Kategori wajib diisi.";
  if (body.price === undefined || body.price === null || body.price === "") return "Harga wajib diisi.";
  if (isNaN(Number(body.price)) || Number(body.price) < 0) return "Harga harus berupa angka dan tidak boleh negatif.";
  return null;
}
