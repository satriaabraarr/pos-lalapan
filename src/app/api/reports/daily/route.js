import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { rentangHarian } from "@/lib/date-range";

export async function GET(request) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const { dateStr, start, end } = rentangHarian(searchParams.get("date"));

  const [agregat, menuTersedia, terbaru] = await Promise.all([
    prisma.transaction.aggregate({
      where: { createdAt: { gte: start, lte: end } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.menu.count({ where: { isAvailable: true } }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    data: {
      tanggal: dateStr,
      totalPemasukan: agregat._sum.totalAmount || 0,
      jumlahTransaksi: agregat._count || 0,
      menuTersedia,
      transaksiTerbaru: terbaru,
    },
  });
}
