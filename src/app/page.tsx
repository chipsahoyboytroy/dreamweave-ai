"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Landing Page + Dream Input
// ═══════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Moon, Brain, Palette, Volume2, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import NebulaBackground from "@/components/NebulaBackground";
import DreamInput from "@/components/DreamInput";
import DreamOutput from "@/components/DreamOutput";
import Footer from "@/components/Footer";
import { saveDreamLocally } from "@/lib/utils";
import { analytics, EVENTS } from "@/lib/analytics";

export default function Home() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [interpretation, setInterpretation] = useState("");
  const [story, setStory] = useState("");
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [dreamId, setDreamId] = useState("");
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    analytics.page("home");
  }, []);

  const handleStreamStart = useCallback(() => {
    // Reset all state
    setInterpretation("");
    setStory("");
    setArchetypes([]);
    setEmotions([]);
    setThemes([]);
    setSummary("");
    setImageUrl("");
    setAudioUrl("");
    setDreamId("");
    setError("");
    setIsStreaming(true);
    setShowResult(true);
  }, []);

  const handleStreamData = useCallback(
    (data: { type: string; content: string }) => {
      switch (data.type) {
        case "interpretation":
          setInterpretation((prev) => prev + data.content);
          break;
        case "story":
          setStory((prev) => prev + data.content);
          break;
        case "archetypes":
          try {
            const parsed = JSON.parse(data.content);
            setArchetypes(parsed.archetypes || []);
            setEmotions(parsed.emotions || []);
            setThemes(parsed.themes || []);
            if (parsed.summary) setSummary(parsed.summary);
          } catch {
            // Ignore
          }
          break;
        case "image":
          if (data.content) setImageUrl(data.content);
          break;
        case "audio":
          if (data.content && data.content !== "generating") {
            setAudioUrl(data.content);
          }
          break;
        case "summary":
          try {
            const s = JSON.parse(data.content);
            if (s.summary) setSummary(s.summary);
            if (s.id) setDreamId(s.id);
          } catch {
            // Ignore
          }
          break;
        case "error":
          setError(data.content);
          break;
        case "done":
          setDreamId(data.content);
          break;
      }
    },
    []
  );

  const handleStreamEnd = useCallback(() => {
    setIsStreaming(false);
    analytics.track(EVENTS.DREAM_COMPLETED);
  }, []);

  const handleDreamSubmit = useCallback(
    (id: string) => {
      // Save to localStorage
      saveDreamLocally({
        id,
        text: "",
        interpretation: interpretation.slice(0, 500),
        archetypes,
        generatedImage: imageUrl,
        createdAt: new Date().toISOString(),
      });
    },
    [interpretation, archetypes, imageUrl]
  );

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Deep Psychological Analysis",
      description:
        "Jungian archetypes meet modern cognitive science for truly personalized dream interpretation.",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "AI Dream Art",
      description:
        "Stunning surreal artwork generated from your dream's unique imagery and emotional landscape.",
    },
    {
      icon: <Volume2 className="w-6 h-6" />,
      title: "Narrated Stories",
      description:
        "Your dream extended into an immersive short story, narrated with a soothing AI voice.",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Shareable Dream Cards",
      description:
        "Beautiful visual cards with your dream's interpretation — share with friends or save for later.",
    },
  ];

  return (
    <main className="min-h-screen relative">
      <NebulaBackground />
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dream-accent/10 border border-dream-accent/20 text-dream-accent-light text-sm font-medium mb-6"
          >
            <Moon className="w-4 h-4" />
            The world&apos;s first multimodal dream interpreter
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight"
          >
            Unlock the{" "}
            <span className="bg-gradient-to-r from-dream-accent via-dream-glow to-purple-400 bg-clip-text text-transparent">
              hidden language
            </span>
            <br />
            of your dreams
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-dream-muted max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Describe, sketch, or speak your dream. Our AI weaves together
            psychology, art, and narrative to reveal what your subconscious is
            telling you — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 text-sm text-dream-muted"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-dream-accent" />
              <span>1 free interpretation</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-dream-border" />
            <div className="flex items-center gap-1.5">
              <span>No signup required</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Dream Input Form */}
        <section className="mb-12">
          <DreamInput
            onDreamSubmit={handleDreamSubmit}
            onStreamStart={handleStreamStart}
            onStreamData={handleStreamData}
            onStreamEnd={handleStreamEnd}
          />
        </section>

        {/* Dream Output (streaming results) */}
        {showResult && (
          <section className="mb-16">
            <DreamOutput
              isStreaming={isStreaming}
              interpretation={interpretation}
              story={story}
              archetypes={archetypes}
              emotions={emotions}
              themes={themes}
              summary={summary}
              imageUrl={imageUrl}
              audioUrl={audioUrl}
              dreamId={dreamId}
              error={error}
            />
          </section>
        )}

        {/* Features Section */}
        {!showResult && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-5xl mx-auto mt-20"
          >
            <h2 className="text-2xl font-display font-bold text-center mb-12">
              How{" "}
              <span className="text-dream-accent-light">DreamWeave</span>{" "}
              works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="p-6 rounded-2xl bg-dream-card/40 border border-dream-border/30 hover:border-dream-accent/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-dream-accent/10 flex items-center justify-center text-dream-accent-light mb-4 group-hover:bg-dream-accent/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-dream-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-dream-muted leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <div className="mt-16 text-center">
              <p className="text-sm text-dream-muted">
                ✨ Over <strong className="text-dream-text">10,000</strong>{" "}
                dreams interpreted and counting
              </p>
            </div>
          </motion.section>
        )}
      </div>

      <Footer />
    </main>
  );
}
