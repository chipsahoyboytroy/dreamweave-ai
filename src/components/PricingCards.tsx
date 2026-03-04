"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Pricing Cards
// ═══════════════════════════════════════════════════════

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, Sparkles, Loader2, Zap, Gift } from "lucide-react";
import { PRICING_PLANS } from "@/types";
import { cn } from "@/lib/utils";
import { isStripeConfigured } from "@/lib/utils";

export default function PricingCards() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    if (!session?.user) {
      signIn("google");
      return;
    }

    if (planId === "free") return;

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Payment processing is not yet configured. Check back soon!");
      }
    } catch {
      alert("Payment processing is not yet configured. Check back soon!");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {PRICING_PLANS.map((plan, i) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "relative flex flex-col rounded-2xl border p-6 transition-all",
            plan.popular
              ? "bg-gradient-to-b from-dream-accent/10 to-dream-card border-dream-accent/50 shadow-xl shadow-dream-accent/10"
              : "bg-dream-card/60 border-dream-border/50 hover:border-dream-border"
          )}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-dream-accent text-white text-xs font-medium">
                <Zap className="w-3 h-3" />
                Most Popular
              </span>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-lg font-display font-bold text-dream-text">
              {plan.name}
            </h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-dream-text">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
              </span>
              {plan.price > 0 && (
                <span className="text-sm text-dream-muted">one-time</span>
              )}
            </div>
            <p className="mt-1 text-sm text-dream-accent-light font-medium">
              {plan.id === "free" ? (
                <span className="flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  {plan.credits} free dreams
                </span>
              ) : (
                `${plan.credits} credits`
              )}
            </p>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-dream-accent mt-0.5 flex-shrink-0" />
                <span className="text-dream-muted">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handlePurchase(plan.id)}
            disabled={loadingPlan === plan.id || plan.id === "free"}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
              plan.id === "free"
                ? "bg-dream-surface text-dream-muted cursor-default"
                : plan.popular
                ? "bg-gradient-to-r from-dream-accent to-purple-500 text-white hover:shadow-lg hover:shadow-dream-accent/25"
                : "bg-dream-surface border border-dream-border text-dream-text hover:bg-dream-card hover:border-dream-accent/30"
            )}
          >
            {loadingPlan === plan.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : plan.id === "free" ? (
              <>
                <Gift className="w-4 h-4" />
                Included Free
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Get {plan.name}
              </>
            )}
          </button>
        </motion.div>
      ))}
    </div>
  );
}
