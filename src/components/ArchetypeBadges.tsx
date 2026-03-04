"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Archetype Badges
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { DREAM_ARCHETYPES } from "@/types";

interface ArchetypeBadgesProps {
  archetypes: string[];
  emotions: string[];
  themes: string[];
}

export default function ArchetypeBadges({ archetypes, emotions, themes }: ArchetypeBadgesProps) {
  return (
    <div className="space-y-4">
      {/* Archetypes */}
      {archetypes.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-dream-muted uppercase tracking-wider mb-2">
            Archetypes Detected
          </h4>
          <div className="flex flex-wrap gap-2">
            {archetypes.map((name, i) => {
              const archetype = DREAM_ARCHETYPES[name];
              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${
                    archetype?.color || "from-purple-500 to-indigo-500"
                  } text-white shadow-lg`}
                  title={archetype?.description}
                >
                  <span>{archetype?.icon || "✨"}</span>
                  <span>{name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emotions */}
      {emotions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-dream-muted uppercase tracking-wider mb-2">
            Emotional Currents
          </h4>
          <div className="flex flex-wrap gap-2">
            {emotions.map((emotion, i) => (
              <motion.span
                key={emotion}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dream-card border border-dream-border text-dream-accent-light"
              >
                {emotion}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Themes */}
      {themes.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-dream-muted uppercase tracking-wider mb-2">
            Themes
          </h4>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme, i) => (
              <motion.span
                key={theme}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dream-surface border border-dream-border/50 text-dream-muted"
              >
                {theme}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
