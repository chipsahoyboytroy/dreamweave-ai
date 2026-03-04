"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Pricing Page
// ═══════════════════════════════════════════════════════

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import NebulaBackground from "@/components/NebulaBackground";
import PricingCards from "@/components/PricingCards";
import Footer from "@/components/Footer";
import { analytics, EVENTS } from "@/lib/analytics";

export default function PricingPage() {
  useEffect(() => {
    analytics.track(EVENTS.PRICING_VIEWED);
  }, []);

  return (
    <main className="min-h-screen relative">
      <NebulaBackground />
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <div className="max-w-6xl mx-auto mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-dream-muted hover:text-dream-accent-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dreams
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dream-accent/10 border border-dream-accent/20 text-dream-accent-light text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple credit-based pricing
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Unlock the{" "}
            <span className="bg-gradient-to-r from-dream-accent to-dream-glow bg-clip-text text-transparent">
              full power
            </span>{" "}
            of DreamWeave
          </h1>

          <p className="text-dream-muted max-w-xl mx-auto leading-relaxed">
            Each credit unlocks a complete dream experience: multimodal analysis,
            AI-generated art, immersive story continuation, and audio narration.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PricingCards />
        </motion.div>

        {/* FAQ / Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto mt-16 space-y-6"
        >
          <h3 className="text-xl font-display font-bold text-center text-dream-text mb-8">
            Frequently Asked Questions
          </h3>

          {[
            {
              q: "What does 1 credit include?",
              a: "One credit gives you a complete dream experience: deep psychological interpretation, creative story continuation, Jungian archetype analysis, and a shareable Dream Card.",
            },
            {
              q: "Do credits expire?",
              a: "No! Credits never expire. Use them whenever inspiration (or a dream) strikes.",
            },
            {
              q: "Can I use DreamWeave for free?",
              a: "Yes! Every user gets 1 free dream interpretation with the full experience — Jungian analysis, story continuation, archetype mapping, and more. No sign-up required.",
            },
            {
              q: "What happens after my free dream?",
              a: "After your free trial, you can purchase credit packs to continue. Each credit unlocks one complete dream interpretation.",
            },
            {
              q: "Is my dream data private?",
              a: "Absolutely. Dreams are personal. We never share your dream content. Shareable Dream Cards only show a brief summary — you control what gets shared.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="p-5 rounded-xl bg-dream-card/40 border border-dream-border/30"
            >
              <h4 className="text-sm font-semibold text-dream-text mb-2">
                {faq.q}
              </h4>
              <p className="text-sm text-dream-muted leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
