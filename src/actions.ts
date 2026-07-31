"use server";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function obtenerGastos() {
  const gastos = await prisma.gasto.findMany();
  return gastos;
}

export async function crearGasto(categoria: string, monto: number, fecha: string, descripcion: string) {
  const nuevoGasto = await prisma.gasto.create({
    data: {
      categoria: categoria,
      monto: monto,
      fecha: fecha,
      descripcion: descripcion,
    },
  });
  return nuevoGasto;
}

export async function borrarGasto(id: number){
    const borrar = await prisma.gasto.delete({where: {id : id}})
}