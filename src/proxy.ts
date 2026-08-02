import { NextResponse } from "next/server";
import { auth } from "./auth";

const rutasPublicas = ["/login", "/registro"];

export default auth((req) => {
  const estaAutenticado = !!req.auth;
  const esRutaPublica = rutasPublicas.includes(req.nextUrl.pathname);

  if (!estaAutenticado && !esRutaPublica) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (estaAutenticado && esRutaPublica) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
