"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Dream Input Form (Main Input Component)
// ═══════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
  Gift,
} from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import ImageUpload from "./ImageUpload";
import { MOOD_OPTIONS } from "@/types";
import { cn, getGuestId } from "@/lib/utils";
import { analytics, EVENTS } from "@/lib/analytics";

interface DreamInputProps {
  onDreamSubmit: (dreamId: string) => void;
  onStreamStart: () => void;
  onStreamData: (data: { type: string; content: string }) => void;
  onStreamEnd: () => void;
}

export default function DreamInput({
  onDreamSubmit,
  onStreamStart,
  onStreamData,
  onStreamEnd,
}: DreamInputProps) {
  const { data: session } = useSession();
  const [dreamText, setDreamText] = useState("");
  const [mood, setMood] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [audioBase64, setAudioBase64] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [remainingDreams, setRemainingDreams] = useState<number | null>(null);

  const hasMultimodal = imageBase64 || audioBase64;
  const canSubmit = dreamText.trim().length >= 10 && !isSubmitting && (remainingDreams === null || remainingDreams > 0);

  // Fetch remaining dreams on mount
  useEffect(() => {
    fetchRemainingDreams();
  }, [session]);

  const fetchRemainingDreams = async () => {
    try {
      const guestId = session?.user?.id ? "" : getGuestId();
      const url = guestId ? `/api/credits?guestId=${guestId}` : "/api/credits";
      const res = await fetch(url);
      const data = await res.json();
      setRemainingDreams(data.remaining ?? data.credits ?? 3);
    } catch {
      setRemainingDreams(3);
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      setIsSubmitting(true);
      onStreamStart();

      analytics.track(EVENTS.DREAM_SUBMITTED, {
        hasImage: !!imageBase64,
        hasAudio: !!audioBase64,
        hasMood: !!mood,
        textLength: dreamText.length,
        remainingDreams: remainingDreams ?? 0,
      });

      try {
        const response = await fetch("/api/dream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: dreamText,
            mood: mood || undefined,
            imageBase64: imageBase64 || undefined,
            audioBase64: audioBase64 || undefined,
            guestId: session?.user?.id ? undefined : getGuestId(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          onStreamData({ type: "error", content: errorData.error || "Request failed" });
          onStreamEnd();
          setIsSubmitting(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                onStreamData(data);

                if (data.type === "done") {
                  onDreamSubmit(data.content);
                }
              } catch {
                // Skip malformed SSE
              }
            }
          }
        }
      } catch (error) {
        console.error("Dream submission error:", error);
        onStreamData({
          type: "error",
          content: "Connection error. Please try again.",
        });
      } finally {
        onStreamEnd();
        setIsSubmitting(false);
        // Refresh remaining dreams count after submission
        fetchRemainingDreams();
      }
    },
    [canSubmit, dreamText, mood, imageBase64, audioBase64, session, onStreamStart, onStreamData, onStreamEnd, onDreamSubmit, remainingDreams]
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-dream-card/60 backdrop-blur-xl rounded-2xl border border-dream-border/50 shadow-2xl overflow-hidden">
        {/* Main text area */}
        <div className="p-6">
          <label className="block text-sm font-medium text-dream-muted mb-2">
            Describe your dream...
          </label>
          <textarea
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="I was walking through a forest of glass trees. The sky was lavender, and I could hear someone calling my name from beneath the roots..."
            rows={5}
            maxLength={5000}
            disabled={isSubmitting}
            className="w-full bg-dream-surface/50 border border-dream-border/50 rounded-xl px-4 py-3 text-dream-text placeholder:text-dream-muted/50 focus:outline-none focus:ring-2 focus:ring-dream-accent/50 focus:border-dream-accent/50 resize-none transition-all text-sm leading-relaxed"
          />

          {/* Voice transcript append */}
          {voiceTranscript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 p-3 rounded-xl bg-dream-accent/10 border border-dream-accent/20 text-sm text-dream-accent-light"
            >
              <p className="text-xs text-dream-muted mb-1">Voice transcript:</p>
              <p>{voiceTranscript}</p>
              <button
                type="button"
                onClick={() => {
                  setDreamText((prev) =>
                    prev ? `${prev}\n\n${voiceTranscript}` : voiceTranscript
                  );
                  setVoiceTranscript("");
                }}
                className="text-xs text-dream-accent underline mt-1"
              >
                Add to dream text
              </button>
            </motion.div>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-dream-muted">
              {dreamText.trim().length < 10
                ? `${10 - dreamText.trim().length} more characters needed`
                : `${dreamText.length}/5000`}
            </span>
          </div>
        </div>

        {/* Mood selector */}
        <div className="px-6 pb-4">
          <label className="block text-xs font-medium text-dream-muted mb-2">
            How are you feeling? (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(mood === m.value ? "" : m.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  mood === m.value
                    ? "bg-dream-accent text-white"
                    : "bg-dream-surface border border-dream-border/50 text-dream-muted hover:text-dream-text hover:border-dream-accent/30"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced inputs toggle */}
        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-dream-muted hover:text-dream-accent-light transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Multimodal inputs (image, voice)
            {!session?.user && <Lock className="w-3 h-3 ml-1" />}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden"
              >
                <ImageUpload
                  onImageSelect={setImageBase64}
                  onClear={() => setImageBase64("")}
                  disabled={isSubmitting}
                />
                <div className="flex flex-col gap-2">
                  <VoiceRecorder
                    onRecordingComplete={setAudioBase64}
                    onTranscript={setVoiceTranscript}
                    disabled={isSubmitting}
                  />
                  {audioBase64 && (
                    <span className="text-xs text-green-400">✓ Audio recorded</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Remaining dreams info & Submit */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Remaining dreams indicator */}
          <div className="flex items-center gap-2 bg-dream-surface rounded-xl px-3 py-2 border border-dream-border/50">
            <Gift className="w-4 h-4 text-dream-gold" />
            <span className="text-xs text-dream-muted">
              {remainingDreams !== null ? (
                remainingDreams > 0 ? (
                  <>
                    <span className="text-dream-text font-medium">{remainingDreams}</span> free {remainingDreams === 1 ? "dream" : "dreams"} remaining
                  </>
                ) : (
                  <span className="text-red-400">No free dreams left</span>
                )
              ) : "..."}
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2",
              canSubmit
                ? "bg-gradient-to-r from-dream-accent to-purple-500 hover:from-dream-accent/90 hover:to-purple-500/90 text-white shadow-lg shadow-dream-accent/25"
                : "bg-dream-surface text-dream-muted cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Weaving your dream...
              </>
            ) : remainingDreams === 0 ? (
              <>
                <Lock className="w-4 h-4" />
                Purchase Credits
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Interpret Dream
              </>
            )}
          </button>
        </div>

        {/* Free tier info */}
        {remainingDreams !== null && remainingDreams > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-dream-accent/5 border border-dream-accent/20">
              <Sparkles className="w-4 h-4 text-dream-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-dream-muted">
                <strong className="text-dream-accent-light">Full experience</strong> included:
                deep psychological interpretation, AI story continuation,
                archetype analysis, and a shareable Dream Card.
              </p>
            </div>
          </div>
        )}

        {/* Out of credits notice */}
        {remainingDreams === 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
              <Lock className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-dream-muted">
                You&apos;ve used your free dream interpretation.{" "}
                <a href="/pricing" className="text-dream-accent underline">
                  Purchase credits
                </a>{" "}
                to continue exploring your dreams.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.form>
  );
}
