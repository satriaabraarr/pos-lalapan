import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { validasiMenu } from "@/lib/validasi";

export async function GET(request) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const onlyAvailable = searchParams.get("available") === "1";

  const menus = await prisma.menu.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(category && category !== "Semua" ? { category } : {}),
      ...(onlyAvailable ? { isAvailable: true } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ data: menus });
}

export async function POST(request) {
  if (!(await getSessionUser())) return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });

  const body = await request.json();
  const error = validasiMenu(body);
  if (error) return NextResponse.json({ message: error }, { status: 422 });

  const menu = await prisma.menu.create({
    data: {
      name: body.name.trim(),
      category: body.category.trim(),
      price: Math.round(Number(body.price)),
      description: body.description?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      isAvailable: body.isAvailable !== false,
    },
  });

  return NextResponse.json({ message: "Menu berhasil ditambahkan.", data: menu }, { status: 201 });
}
