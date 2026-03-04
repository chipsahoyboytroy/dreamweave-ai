"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Credit Balance Component
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Gift } from "lucide-react";
import Link from "next/link";
import { getGuestId } from "@/lib/utils";

export default function CreditBalance() {
  const { data: session } = useSession();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetchCredits();
  }, [session]);

  const fetchCredits = async () => {
    try {
      const guestId = session?.user?.id ? "" : getGuestId();
      const url = guestId ? `/api/credits?guestId=${guestId}` : "/api/credits";
      const res = await fetch(url);
      const data = await res.json();
      setRemaining(data.remaining ?? data.credits ?? 0);
    } catch {
      setRemaining(null);
    }
  };

  return (
    <Link
      href="/pricing"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dream-card border border-dream-border hover:border-dream-accent/50 transition-colors"
    >
      <Gift className="w-4 h-4 text-dream-gold" />
      <span className="text-sm font-medium text-dream-text">
        {remaining !== null ? `${remaining} free` : "..."}
      </span>
    </Link>
  );
}
