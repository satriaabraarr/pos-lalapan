import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { rentangTahunan } from "@/lib/date-range";

const NAMA_BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export async function GET(request) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const { year, start, end } = rentangTahunan(searchParams.get("year"));

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { totalAmount: true, createdAt: true },
  });

  // Siapkan "wadah" untuk tiap bulan (Jan-Des), default 0
  const bulanan = Array.from({ length: 12 }, (_, i) => ({
    bulan: i + 1,
    label: NAMA_BULAN_SINGKAT[i],
    total: 0,
    jumlahTransaksi: 0,
  }));

  for (const t of transactions) {
    const tglStr = new Date(t.createdAt).toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }); // YYYY-MM-DD
    const bulanKe = Number(tglStr.split("-")[1]); // 1-12
    if (bulanan[bulanKe - 1]) {
      bulanan[bulanKe - 1].total += t.totalAmount;
      bulanan[bulanKe - 1].jumlahTransaksi += 1;
    }
  }

  const totalPemasukan = transactions.reduce((acc, t) => acc + t.totalAmount, 0);

  return NextResponse.json({
    data: {
      year,
      totalPemasukan,
      jumlahTransaksi: transactions.length,
      bulanan,
    },
  });
}