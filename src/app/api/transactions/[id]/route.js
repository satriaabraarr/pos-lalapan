import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(_request, { params }) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(params.id) },
    include: { items: true },
  });

  if (!transaction) return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ data: transaction });
}
