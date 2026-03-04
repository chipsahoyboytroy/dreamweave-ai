"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Dream Card (shareable visual card)
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface DreamCardProps {
  summary: string;
  archetypes: string[];
  imageUrl?: string;
}

export default function DreamCard({ summary, archetypes, imageUrl }: DreamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-2xl"
    >
      {/* Background image or gradient */}
      <div className="relative aspect-[4/5]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Dream visualization"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dream-accent via-purple-800 to-dream-bg" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Archetype pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {archetypes.slice(0, 3).map((a) => (
              <span
                key={a}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm"
              >
                {a}
              </span>
            ))}
          </div>

          {/* Summary */}
          <p className="text-white text-sm leading-relaxed font-medium mb-4 line-clamp-4">
            &ldquo;{summary}&rdquo;
          </p>

          {/* Branding */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-dream-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">
              DreamWeave AI
            </span>
            <span className="text-white/40 text-xs ml-auto">
              dreamweave.ai
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
