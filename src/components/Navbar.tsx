"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Navbar
// ═══════════════════════════════════════════════════════

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, Menu, X, LogOut, User, CreditCard } from "lucide-react";
import CreditBalance from "./CreditBalance";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dream-bg/80 backdrop-blur-xl border-b border-dream-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dream-accent to-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-dream-accent-light to-dream-glow bg-clip-text text-transparent">
              DreamWeave
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-dream-muted hover:text-dream-text transition-colors text-sm"
            >
              <CreditCard className="w-4 h-4 inline mr-1" />
              Pricing
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-4">
                <CreditBalance />
                <div className="relative group">
                  <button className="flex items-center gap-2 text-dream-muted hover:text-dream-text transition-colors">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-8 h-8 rounded-full border border-dream-border"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="text-sm">{session.user.name?.split(" ")[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-dream-card border border-dream-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={() => signOut()}
                      className="w-full px-4 py-3 text-left text-sm text-dream-muted hover:text-dream-text hover:bg-dream-surface rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 rounded-xl bg-dream-accent hover:bg-dream-accent/80 text-white text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-dream-muted"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-dream-border/30 mt-2 pt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link
                href="/pricing"
                className="text-dream-muted hover:text-dream-text transition-colors text-sm px-2"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              {session?.user ? (
                <>
                  <div className="px-2">
                    <CreditBalance />
                  </div>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="text-dream-muted hover:text-dream-text transition-colors text-sm px-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { signIn("google"); setMenuOpen(false); }}
                  className="px-4 py-2 rounded-xl bg-dream-accent text-white text-sm font-medium mx-2"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
