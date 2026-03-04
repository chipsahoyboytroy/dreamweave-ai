// ═══════════════════════════════════════════════════════
// DreamWeave AI — NextAuth Configuration
// SECURITY: Hardened session, cookie flags, CSRF protection (OWASP A01, A02, A07)
// ═══════════════════════════════════════════════════════

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

// SECURITY: Detect production environment for cookie/session hardening
const isProduction = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    // SECURITY: Session expires after 24 hours of inactivity (OWASP A07: session management)
    maxAge: 24 * 60 * 60, // 24 hours
    // SECURITY: Session token is refreshed every 15 minutes to limit window of token theft
    updateAge: 15 * 60, // 15 minutes
  },
  // SECURITY: Hardened cookie configuration (OWASP A02, A07)
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        // SECURITY: HttpOnly prevents JavaScript access to session cookie (XSS mitigation)
        httpOnly: true,
        // SECURITY: SameSite=lax prevents CSRF attacks via cross-site navigation
        sameSite: "lax" as const,
        path: "/",
        // SECURITY: Secure flag ensures cookie only sent over HTTPS (blocks MitM)
        secure: isProduction,
      },
    },
    csrfToken: {
      name: isProduction ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: isProduction,
      },
    },
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // SECURITY: Record token issuance time for future expiration checks
        token.iat = Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        // Fetch credits
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { credits: true, tier: true },
        });
        if (dbUser) {
          (session.user as unknown as Record<string, unknown>).credits = dbUser.credits;
          (session.user as unknown as Record<string, unknown>).tier = dbUser.tier;
        }
      }
      return session;
    },
  },
});
