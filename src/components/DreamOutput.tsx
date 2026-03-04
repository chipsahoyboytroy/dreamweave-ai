"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Dream Output Component (Streaming Results)
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  BookOpen,
  Image as ImageIcon,
  Volume2,
  ScrollText,
  Share2,
  Sparkles,
} from "lucide-react";
import ArchetypeBadges from "./ArchetypeBadges";
import AudioPlayer from "./AudioPlayer";
import ShareButtons from "./ShareButtons";
import DreamCard from "./DreamCard";
import { cn } from "@/lib/utils";

interface DreamOutputProps {
  isStreaming: boolean;
  interpretation: string;
  story: string;
  archetypes: string[];
  emotions: string[];
  themes: string[];
  summary: string;
  imageUrl: string;
  audioUrl: string;
  dreamId: string;
  error: string;
}

type Tab = "interpretation" | "story" | "image" | "audio" | "card";

export default function DreamOutput({
  isStreaming,
  interpretation,
  story,
  archetypes,
  emotions,
  themes,
  summary,
  imageUrl,
  audioUrl,
  dreamId,
  error,
}: DreamOutputProps) {
  const [activeTab, setActiveTab] = useState<Tab>("interpretation");
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [interpretation, story, isStreaming]);

  // Auto-switch tabs as content arrives
  useEffect(() => {
    if (story && activeTab === "interpretation" && !isStreaming) {
      // Don't auto-switch, let user explore
    }
  }, [story, activeTab, isStreaming]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl mx-auto mt-8"
      >
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (!interpretation && !isStreaming) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; available: boolean }[] = [
    {
      id: "interpretation",
      label: "Interpretation",
      icon: <ScrollText className="w-4 h-4" />,
      available: true,
    },
    {
      id: "story",
      label: "Story",
      icon: <BookOpen className="w-4 h-4" />,
      available: !!story,
    },
    {
      id: "image",
      label: "Dream Art",
      icon: <ImageIcon className="w-4 h-4" />,
      available: !!imageUrl,
    },
    {
      id: "audio",
      label: "Narration",
      icon: <Volume2 className="w-4 h-4" />,
      available: !!audioUrl,
    },
    {
      id: "card",
      label: "Dream Card",
      icon: <Share2 className="w-4 h-4" />,
      available: !!summary && !!dreamId,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mt-8 space-y-6"
    >
      {/* Archetype badges */}
      {archetypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ArchetypeBadges
            archetypes={archetypes}
            emotions={emotions}
            themes={themes}
          />
        </motion.div>
      )}

      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 bg-dream-card/60 backdrop-blur-xl rounded-xl border border-dream-border/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.available && setActiveTab(tab.id)}
            disabled={!tab.available}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-dream-accent text-white shadow"
                : tab.available
                ? "text-dream-muted hover:text-dream-text"
                : "text-dream-muted/30 cursor-not-allowed"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="bg-dream-card/60 backdrop-blur-xl rounded-2xl border border-dream-border/50 shadow-2xl overflow-hidden">
        <div
          ref={contentRef}
          className="max-h-[70vh] overflow-y-auto p-6 sm:p-8"
        >
          <AnimatePresence mode="wait">
            {/* Interpretation Tab */}
            {activeTab === "interpretation" && (
              <motion.div
                key="interpretation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prose prose-invert prose-sm max-w-none 
                  prose-headings:text-dream-accent-light prose-headings:font-display
                  prose-p:text-dream-text/90 prose-p:leading-relaxed
                  prose-strong:text-dream-accent-light
                  prose-li:text-dream-text/80
                  prose-a:text-dream-accent"
              >
                <ReactMarkdown>{interpretation}</ReactMarkdown>
                {isStreaming && !story && (
                  <span className="inline-block w-2 h-5 bg-dream-accent animate-pulse ml-1" />
                )}
              </motion.div>
            )}

            {/* Story Tab */}
            {activeTab === "story" && (
              <motion.div
                key="story"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-dream-glow prose-headings:font-display
                  prose-p:text-dream-text/90 prose-p:leading-relaxed prose-p:text-base
                  prose-strong:text-dream-glow"
              >
                <ReactMarkdown>{story}</ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-2 h-5 bg-dream-glow animate-pulse ml-1" />
                )}
              </motion.div>
            )}

            {/* Image Tab */}
            {activeTab === "image" && imageUrl && (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative w-full rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={imageUrl}
                    alt="AI-generated dream visualization"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-dream-gold" />
                    <span className="text-xs text-white/80">AI Generated</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Audio Tab */}
            {activeTab === "audio" && (
              <motion.div
                key="audio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AudioPlayer src={audioUrl} title="Dream Narration" />
                <p className="text-xs text-dream-muted mt-3">
                  Listen to an AI-narrated interpretation of your dream, with a
                  warm voice designed for reflection and mindfulness.
                </p>
              </motion.div>
            )}

            {/* Dream Card Tab */}
            {activeTab === "card" && summary && (
              <motion.div
                key="card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <DreamCard
                  summary={summary}
                  archetypes={archetypes}
                  imageUrl={imageUrl}
                />
                <div className="flex justify-center">
                  <ShareButtons dreamId={dreamId} summary={summary} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with share */}
        {dreamId && !isStreaming && (
          <div className="px-6 pb-6 flex items-center justify-between border-t border-dream-border/30 pt-4">
            <span className="text-xs text-dream-muted">
              Dream #{dreamId.slice(0, 8)}
            </span>
            <ShareButtons dreamId={dreamId} summary={summary} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
