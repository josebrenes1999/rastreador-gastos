"use server";
import { prisma } from "./db";
import { auth } from "./auth";

async function obtenerUsuarioId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }
  return Number(session.user.id);
}

export async function obtenerGastos() {
  const usuarioId = await obtenerUsuarioId();
  const gastos = await prisma.gasto.findMany({
    where: { categoria: { usuarioId } },
    include: { categoria: true },
  });
  return gastos;
}

export async function crearGasto(categoriaId: number, monto: number, fecha: string, descripcion: string) {
  const usuarioId = await obtenerUsuarioId();
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria || categoria.usuarioId !== usuarioId) {
    throw new Error("Categoría inválida");
  }

  const nuevoGasto = await prisma.gasto.create({
    data: { categoriaId, monto, fecha: new Date(fecha), descripcion },
  });
  return nuevoGasto;
}

export async function actualizarGasto(
  id: number,
  categoriaId: number,
  monto: number,
  fecha: string,
  descripcion: string
) {
  const usuarioId = await obtenerUsuarioId();
  const gasto = await prisma.gasto.findUnique({ where: { id }, include: { categoria: true } });
  if (!gasto || gasto.categoria.usuarioId !== usuarioId) {
    throw new Error("Gasto inválido");
  }

  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria || categoria.usuarioId !== usuarioId) {
    throw new Error("Categoría inválida");
  }

  const actualizado = await prisma.gasto.update({
    where: { id },
    data: { categoriaId, monto, fecha: new Date(fecha), descripcion },
    include: { categoria: true },
  });
  return actualizado;
}

export async function borrarGasto(id: number) {
  const usuarioId = await obtenerUsuarioId();
  const gasto = await prisma.gasto.findUnique({
    where: { id },
    include: { categoria: true },
  });
  if (!gasto || gasto.categoria.usuarioId !== usuarioId) {
    throw new Error("Gasto inválido");
  }

  await prisma.gasto.delete({ where: { id } });
}

export async function obtenerIngresos() {
  const usuarioId = await obtenerUsuarioId();
  const ingresos = await prisma.ingreso.findMany({ where: { usuarioId } });
  return ingresos;
}

export async function crearIngreso(monto: number, fecha: string, descripcion: string) {
  const usuarioId = await obtenerUsuarioId();
  const nuevoIngreso = await prisma.ingreso.create({
    data: { usuarioId, monto, fecha: new Date(fecha), descripcion },
  });
  return nuevoIngreso;
}

export async function actualizarIngreso(id: number, monto: number, fecha: string, descripcion: string) {
  const usuarioId = await obtenerUsuarioId();
  const ingreso = await prisma.ingreso.findUnique({ where: { id } });
  if (!ingreso || ingreso.usuarioId !== usuarioId) {
    throw new Error("Ingreso inválido");
  }

  const actualizado = await prisma.ingreso.update({
    where: { id },
    data: { monto, fecha: new Date(fecha), descripcion },
  });
  return actualizado;
}

export async function borrarIngreso(id: number) {
  const usuarioId = await obtenerUsuarioId();
  const ingreso = await prisma.ingreso.findUnique({ where: { id } });
  if (!ingreso || ingreso.usuarioId !== usuarioId) {
    throw new Error("Ingreso inválido");
  }

  await prisma.ingreso.delete({ where: { id } });
}

export async function crearCategoria(nombre: string, limite: number, color: string) {
  const usuarioId = await obtenerUsuarioId();
  const nuevaCategoria = await prisma.categoria.create({
    data: { nombre, limite, color, usuarioId },
  });
  return nuevaCategoria;
}

export async function actualizarCategoria(id: number, nombre: string, limite: number, color: string) {
  const usuarioId = await obtenerUsuarioId();
  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria || categoria.usuarioId !== usuarioId) {
    throw new Error("Categoría inválida");
  }

  const actualizada = await prisma.categoria.update({
    where: { id },
    data: { nombre, limite, color },
  });
  return actualizada;
}

export async function borrarCategoria(id: number) {
  const usuarioId = await obtenerUsuarioId();
  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria || categoria.usuarioId !== usuarioId) {
    throw new Error("Categoría inválida");
  }

  const gastosAsociados = await prisma.gasto.count({ where: { categoriaId: id } });
  if (gastosAsociados > 0) {
    throw new Error("No puedes borrar una categoría con gastos. Bórralos o cámbialos de categoría primero.");
  }

  await prisma.categoria.delete({ where: { id } });
}

export async function obtenerCategorias() {
  const usuarioId = await obtenerUsuarioId();
  const categorias = await prisma.categoria.findMany({ where: { usuarioId } });
  return categorias;
}

export async function obtenerConfiguracion() {
  const usuarioId = await obtenerUsuarioId();
  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { id: usuarioId },
    select: { presupuestoMensual: true, cicloInicio: true, cicloDuracionDias: true },
  });
  return usuario;
}

export async function actualizarConfiguracion(
  presupuestoMensual: number,
  cicloInicio: string,
  cicloDuracionDias: number
) {
  const usuarioId = await obtenerUsuarioId();
  const usuario = await prisma.usuario.update({
    where: { id: usuarioId },
    data: { presupuestoMensual, cicloInicio: new Date(cicloInicio), cicloDuracionDias },
    select: { presupuestoMensual: true, cicloInicio: true, cicloDuracionDias: true },
  });
  return usuario;
}
