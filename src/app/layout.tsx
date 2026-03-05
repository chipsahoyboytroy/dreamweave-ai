import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "DreamWeave AI — Multimodal Dream Interpreter & Narrative Weaver",
  description:
    "The world's first real-time multimodal dream interpreter. Upload text, images, or voice recordings of your dreams and receive instant psychological interpretations, creative stories, generated art, and audio narration.",
  keywords: [
    "dream interpreter",
    "AI dream analysis",
    "dream meaning",
    "Jungian analysis",
    "dream art",
    "dream journal",
    "AI storytelling",
    "multimodal AI",
  ],
  openGraph: {
    title: "DreamWeave AI — What Do Your Dreams Mean?",
    description:
      "Discover the hidden language of your subconscious. AI-powered dream interpretation with generated art, stories, and narration.",
    type: "website",
    url: "https://dreamweave.ai",
    siteName: "DreamWeave AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "DreamWeave AI — Multimodal Dream Interpreter",
    description:
      "AI-powered dream analysis with generated art, stories, and narration.",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dream-bg text-dream-text antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
