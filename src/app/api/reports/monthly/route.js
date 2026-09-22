import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { rentangBulanan } from "@/lib/date-range";

export async function GET(request) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const { year, month, daysInMonth, bulanStr, start, end } = rentangBulanan(searchParams.get("month"));

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 500, // batas wajar untuk 1 bulan; naikkan kalau transaksi warung sudah sangat ramai
  });

  // Siapkan "wadah" untuk tiap tanggal dalam bulan ini, default 0
  const harian = Array.from({ length: daysInMonth }, (_, i) => ({ tanggal: i + 1, total: 0 }));

  for (const t of transactions) {
    const tglStr = new Date(t.createdAt).toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }); // YYYY-MM-DD
    const hari = Number(tglStr.split("-")[2]);
    if (harian[hari - 1]) harian[hari - 1].total += t.totalAmount;
  }

  const totalPemasukan = transactions.reduce((acc, t) => acc + t.totalAmount, 0);

  return NextResponse.json({
    data: {
      bulanStr,
      year,
      month,
      daysInMonth,
      totalPemasukan,
      jumlahTransaksi: transactions.length,
      harian,
      transaksi: transactions,
    },
  });
}