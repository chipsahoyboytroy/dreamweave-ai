"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Share Buttons
// ═══════════════════════════════════════════════════════

import { Share2, Twitter, Link2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { generateShareUrl, generateShareText, truncate } from "@/lib/utils";

interface ShareButtonsProps {
  dreamId: string;
  summary: string;
}

export default function ShareButtons({ dreamId, summary }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = generateShareUrl(dreamId);
  const shareText = generateShareText(summary);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My Dream Interpretation — DreamWeave AI",
        text: truncate(summary, 200),
        url: shareUrl,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareNative}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dream-card border border-dream-border text-dream-muted hover:text-dream-text hover:border-dream-accent/50 transition-all text-sm"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
      <button
        onClick={shareToTwitter}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dream-card border border-dream-border text-dream-muted hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-all text-sm"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dream-card border border-dream-border text-dream-muted hover:text-dream-text hover:border-dream-accent/50 transition-all text-sm"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
