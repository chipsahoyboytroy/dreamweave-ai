// ═══════════════════════════════════════════════════════
// DreamWeave AI — Stripe Configuration
// ═══════════════════════════════════════════════════════

import Stripe from "stripe";

// Stripe is optional — the app works without it. Only needed when accepting payments.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

/** Returns true if Stripe is configured */
export function isStripeAvailable(): boolean {
  return stripe !== null;
}

export const CREDIT_PACKS: Record<string, { credits: number; name: string }> = {
  starter: { credits: 15, name: "Lucid Starter" },
  explorer: { credits: 40, name: "Dream Explorer" },
  visionary: { credits: 100, name: "Visionary" },
};

export function getPriceId(plan: string): string {
  const envMap: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER || "",
    explorer: process.env.STRIPE_PRICE_EXPLORER || "",
    visionary: process.env.STRIPE_PRICE_VISIONARY || "",
  };
  return envMap[plan] || "";
}
