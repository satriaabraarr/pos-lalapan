import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
    }

    const token = await createToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    const res = NextResponse.json({
      message: "Login berhasil.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    return setAuthCookie(res, token);
  } catch (e) {
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
