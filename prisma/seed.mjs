import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const MENUS = [
  { name: "Ayam Lalapan", category: "Makanan", price: 18000, description: "Ayam goreng kremes + nasi, lalapan, sambal" },
  { name: "Lele Lalapan", category: "Makanan", price: 15000, description: "Lele goreng renyah + nasi dan sambal terasi" },
  { name: "Bebek Lalapan", category: "Makanan", price: 25000, description: "Bebek goreng empuk + nasi dan sambal" },
  { name: "Nasi Goreng", category: "Makanan", price: 15000, description: "Nasi goreng spesial telur" },
  { name: "Tempe Goreng", category: "Makanan", price: 5000, description: "Tempe goreng tepung (2 potong)" },
  { name: "Tahu Goreng", category: "Makanan", price: 5000, description: "Tahu goreng crispy (2 potong)" },
  { name: "Es Teh", category: "Minuman", price: 4000, description: "Es teh manis segar" },
  { name: "Es Jeruk", category: "Minuman", price: 6000, description: "Es jeruk peras" },
  { name: "Teh Hangat", category: "Minuman", price: 3000, description: "Teh tubruk hangat" },
  { name: "Kopi", category: "Minuman", price: 5000, description: "Kopi hitam tubruk" },
  { name: "Air Mineral", category: "Minuman", price: 4000, description: "Air mineral botol 600ml" },
  { name: "Kerupuk", category: "Tambahan", price: 2000, description: "Kerupuk udang" },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "kasir@lalapanku.id" },
    update: {},
    create: { name: "Bang Roy", email: "kasir@lalapanku.id", password: passwordHash, role: "kasir" },
  });

  await prisma.user.upsert({
    where: { email: "pemilik@lalapanku.id" },
    update: {},
    create: { name: "Pak Warno", email: "pemilik@lalapanku.id", password: passwordHash, role: "pemilik" },
  });

  for (const m of MENUS) {
    const exists = await prisma.menu.findFirst({ where: { name: m.name } });
    if (!exists) await prisma.menu.create({ data: m });
  }

  console.log("Seed selesai.");
  console.log("Login kasir  : kasir@lalapanku.id / password123");
  console.log("Login pemilik: pemilik@lalapanku.id / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
