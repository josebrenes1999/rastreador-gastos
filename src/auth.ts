import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        contrasena: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const contrasena = credentials?.contrasena as string | undefined;
        if (!email || !contrasena) return null;

        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) return null;

        const esValida = await bcrypt.compare(contrasena, usuario.contrasenaHash);
        if (!esValida) return null;

        return { id: String(usuario.id), name: usuario.nombre, email: usuario.email };
      },
    }),
  ],
});
