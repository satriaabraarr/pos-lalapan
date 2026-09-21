import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { validasiMenu } from "@/lib/validasi";

export async function GET(_request, { params }) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });
  const menu = await prisma.menu.findUnique({ where: { id: Number(params.id) } });
  if (!menu) return NextResponse.json({ message: "Menu tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ data: menu });
}

export async function PUT(request, { params }) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const body = await request.json();

  // Update status tersedia saja (toggle cepat dari tabel)
  if (Object.keys(body).length === 1 && "isAvailable" in body) {
    const menu = await prisma.menu.update({
      where: { id: Number(params.id) },
      data: { isAvailable: Boolean(body.isAvailable) },
    });
    return NextResponse.json({ message: "Status menu diperbarui.", data: menu });
  }

  const error = validasiMenu(body);
  if (error) return NextResponse.json({ message: error }, { status: 422 });

  const menu = await prisma.menu.update({
    where: { id: Number(params.id) },
    data: {
      name: body.name.trim(),
      category: body.category.trim(),
      price: Math.round(Number(body.price)),
      description: body.description?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      isAvailable: body.isAvailable !== false,
    },
  });

  return NextResponse.json({ message: "Menu berhasil diperbarui.", data: menu });
}

export async function DELETE(_request, { params }) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });
  await prisma.menu.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ message: "Menu berhasil dihapus." });
}
