"use server";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function obtenerGastos() {
  const gastos = await prisma.gasto.findMany({
    include: { categoria: true },
  });
  return gastos;
}

export async function crearGasto(categoriaId: number, monto: number, fecha: string, descripcion: string) {
  const nuevoGasto = await prisma.gasto.create({
    data: { categoriaId, monto, fecha, descripcion },
  });
  return nuevoGasto;
}

export async function borrarGasto(id: number) {
  await prisma.gasto.delete({ where: { id } });
}

export async function crearCategoria(nombre: string, limite: number, color: string) {
  const nuevaCategoria = await prisma.categoria.create({
    data: { nombre, limite, color },
  });
  return nuevaCategoria;
}

export async function obtenerCategorias() {
  const categorias = await prisma.categoria.findMany();
  return categorias;
}