"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Shared Dream Page (dream/[id])
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  ScrollText,
  BookOpen,
  Image as ImageIcon,
  Share2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import NebulaBackground from "@/components/NebulaBackground";
import ArchetypeBadges from "@/components/ArchetypeBadges";
import DreamCard from "@/components/DreamCard";
import ShareButtons from "@/components/ShareButtons";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

interface DreamData {
  id: string;
  textInput: string;
  mood: string | null;
  interpretation: string | null;
  story: string | null;
  archetypes: string[];
  emotions: string[];
  themes: string[];
  generatedImage: string | null;
  summary: string | null;
  createdAt: string;
}

type Tab = "interpretation" | "story" | "image" | "card";

export default function DreamPage() {
  const params = useParams();
  const dreamId = params.id as string;

  const [dream, setDream] = useState<DreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("interpretation");

  useEffect(() => {
    if (!dreamId) return;

    const fetchDream = async () => {
      try {
        const res = await fetch(`/api/dream/${dreamId}`);
        if (!res.ok) {
          setError("Dream not found");
          return;
        }
        const data = await res.json();
        setDream(data);
      } catch {
        setError("Failed to load dream");
      } finally {
        setLoading(false);
      }
    };

    fetchDream();
  }, [dreamId]);

  if (loading) {
    return (
      <main className="min-h-screen relative">
        <NebulaBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-dream-accent animate-spin mx-auto mb-4" />
            <p className="text-dream-muted">Loading dream...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !dream) {
    return (
      <main className="min-h-screen relative">
        <NebulaBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-2xl font-display text-dream-text mb-4">
              Dream not found
            </p>
            <p className="text-dream-muted mb-6">
              This dream may have faded from memory...
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dream-accent text-white font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Interpret a new dream
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; available: boolean }[] = [
    {
      id: "interpretation",
      label: "Interpretation",
      icon: <ScrollText className="w-4 h-4" />,
      available: !!dream.interpretation,
    },
    {
      id: "story",
      label: "Story",
      icon: <BookOpen className="w-4 h-4" />,
      available: !!dream.story,
    },
    {
      id: "image",
      label: "Dream Art",
      icon: <ImageIcon className="w-4 h-4" />,
      available: !!dream.generatedImage,
    },
    {
      id: "card",
      label: "Dream Card",
      icon: <Share2 className="w-4 h-4" />,
      available: !!dream.summary,
    },
  ];

  return (
    <main className="min-h-screen relative">
      <NebulaBackground />
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-dream-muted hover:text-dream-accent-light transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Interpret another dream
          </Link>

          {/* Dream header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-dream-accent" />
              <span className="text-sm text-dream-muted">
                Dream interpreted on{" "}
                {new Date(dream.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {dream.summary && (
              <p className="text-lg font-display text-dream-text italic leading-relaxed">
                &ldquo;{dream.summary}&rdquo;
              </p>
            )}
          </motion.div>

          {/* Archetype badges */}
          {dream.archetypes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <ArchetypeBadges
                archetypes={dream.archetypes}
                emotions={dream.emotions}
                themes={dream.themes}
              />
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-dream-card/60 backdrop-blur-xl rounded-xl border border-dream-border/50 overflow-x-auto mb-6">
            {tabs
              .filter((t) => t.available)
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-dream-accent text-white shadow"
                      : "text-dream-muted hover:text-dream-text"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-dream-card/60 backdrop-blur-xl rounded-2xl border border-dream-border/50 shadow-2xl overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              {activeTab === "interpretation" && dream.interpretation && (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-dream-accent-light prose-headings:font-display prose-p:text-dream-text/90 prose-strong:text-dream-accent-light">
                  <ReactMarkdown>{dream.interpretation}</ReactMarkdown>
                </div>
              )}

              {activeTab === "story" && dream.story && (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-dream-glow prose-headings:font-display prose-p:text-dream-text/90 prose-p:text-base prose-strong:text-dream-glow">
                  <ReactMarkdown>{dream.story}</ReactMarkdown>
                </div>
              )}

              {activeTab === "image" && dream.generatedImage && (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={dream.generatedImage}
                    alt="AI-generated dream visualization"
                    className="w-full rounded-xl shadow-2xl"
                  />
                </div>
              )}

              {activeTab === "card" && dream.summary && (
                <div className="space-y-6">
                  <DreamCard
                    summary={dream.summary}
                    archetypes={dream.archetypes}
                    imageUrl={dream.generatedImage || undefined}
                  />
                  <div className="flex justify-center">
                    <ShareButtons dreamId={dream.id} summary={dream.summary} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Share footer */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-dream-muted">
              Dream #{dream.id.slice(0, 8)}
            </span>
            <ShareButtons
              dreamId={dream.id}
              summary={dream.summary || "A dream interpreted by DreamWeave AI"}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
