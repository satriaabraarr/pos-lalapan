import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { rentangHarian, rentangBulanan } from "@/lib/date-range";

/** Nomor transaksi unik: TRX-YYYYMMDD-0001 (urut per hari) */
async function buatNomorTransaksi() {
  const { dateStr, start, end } = rentangHarian();
  const jumlah = await prisma.transaction.count({ where: { createdAt: { gte: start, lte: end } } });
  const urut = String(jumlah + 1).padStart(4, "0");
  return `TRX-${dateStr.replaceAll("-", "")}-${urut}`;
}

export async function GET(request) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");          // YYYY-MM-DD (opsional)
  const month = searchParams.get("month");        // YYYY-MM (opsional, dipakai Laporan Bulanan)
  const q = searchParams.get("q")?.trim();        // cari nomor transaksi
  const limit = Number(searchParams.get("limit") || (month ? 1000 : 100));

  const where = {};
  if (date) {
    const { start, end } = rentangHarian(date);
    where.createdAt = { gte: start, lte: end };
  } else if (month) {
    const { start, end } = rentangBulanan(month);
    where.createdAt = { gte: start, lte: end };
  }
  if (q) where.transactionNumber = { contains: q, mode: "insensitive" };

  const [transactions, agregat] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.transaction.aggregate({ where, _sum: { totalAmount: true }, _count: true }),
  ]);

  return NextResponse.json({
    data: transactions,
    summary: {
      totalPemasukan: agregat._sum.totalAmount || 0,
      jumlahTransaksi: agregat._count || 0,
    },
  });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const body = await request.json();
  const items = Array.isArray(body?.items) ? body.items : [];

  if (items.length === 0) {
    return NextResponse.json({ message: "Transaksi harus memiliki minimal satu menu." }, { status: 422 });
  }

  // Ambil harga TERBARU dari database (jangan percaya harga dari client)
  const menuIds = items.map((i) => Number(i.menuId));
  const menus = await prisma.menu.findMany({ where: { id: { in: menuIds } } });
  const peta = new Map(menus.map((m) => [m.id, m]));

  const itemData = [];
  for (const item of items) {
    const menu = peta.get(Number(item.menuId));
    if (!menu) return NextResponse.json({ message: `Menu dengan id ${item.menuId} tidak ditemukan.` }, { status: 422 });
    if (!menu.isAvailable) return NextResponse.json({ message: `Menu "${menu.name}" sedang tidak tersedia.` }, { status: 422 });

    const quantity = Math.round(Number(item.quantity));
    if (!quantity || quantity < 1) return NextResponse.json({ message: `Jumlah pesanan "${menu.name}" tidak valid.` }, { status: 422 });

    itemData.push({
      menuId: menu.id,
      menuName: menu.name,   // snapshot nama saat transaksi
      price: menu.price,     // snapshot harga saat transaksi
      quantity,
      subtotal: menu.price * quantity,
      note: item.note?.trim() || null,
    });
  }

  const totalAmount = itemData.reduce((acc, i) => acc + i.subtotal, 0);
  const paidAmount = Math.round(Number(body.paidAmount));

  if (isNaN(paidAmount) || paidAmount < totalAmount) {
    return NextResponse.json({ message: "Nominal pembayaran tidak boleh kurang dari total." }, { status: 422 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      transactionNumber: await buatNomorTransaksi(),
      totalAmount,
      paidAmount,
      changeAmount: paidAmount - totalAmount,
      cashierName: user.name,
      items: { create: itemData },
    },
    include: { items: true },
  });

  return NextResponse.json({ message: "Transaksi berhasil disimpan.", data: transaction }, { status: 201 });
}