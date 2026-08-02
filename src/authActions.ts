"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "./db";
import { signIn, signOut } from "./auth";

export async function registrarUsuario(nombre: string, email: string, contrasena: string) {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return "Ya existe una cuenta con ese email";
  }

  const contrasenaHash = await bcrypt.hash(contrasena, 10);
  await prisma.usuario.create({ data: { nombre, email, contrasenaHash } });
}

export async function iniciarSesion(email: string, contrasena: string) {
  try {
    await signIn("credentials", { email, contrasena, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email o contraseña incorrectos";
    }
    throw error;
  }
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/login" });
}
