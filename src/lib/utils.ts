import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(credits: number): string {
  return credits === 1 ? "1 credit" : `${credits} credits`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let guestId = localStorage.getItem("dreamweave_guest_id");
  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem("dreamweave_guest_id", guestId);
  }
  return guestId;
}

export function saveDreamLocally(dream: {
  id: string;
  text: string;
  interpretation?: string;
  story?: string;
  archetypes?: string[];
  generatedImage?: string;
  createdAt: string;
}) {
  if (typeof window === "undefined") return;
  const dreams = getDreamHistory();
  dreams.unshift(dream);
  // Keep last 50 dreams
  const trimmed = dreams.slice(0, 50);
  localStorage.setItem("dreamweave_history", JSON.stringify(trimmed));
}

export function getDreamHistory(): Array<{
  id: string;
  text: string;
  interpretation?: string;
  story?: string;
  archetypes?: string[];
  generatedImage?: string;
  createdAt: string;
}> {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("dreamweave_history");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function generateShareUrl(dreamId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dreamweave.ai";
  return `${baseUrl}/dream/${dreamId}`;
}

/** Check if Stripe is configured (client-safe — uses public env var) */
export function isStripeConfigured(): boolean {
  return !!(
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_STRIPE_CONFIGURED === "true"
      : process.env.STRIPE_SECRET_KEY
  );
}

export function generateShareText(summary: string): string {
  return `✨ I just had my dream interpreted by DreamWeave AI!\n\n"${truncate(summary, 200)}"\n\nDiscover what your dreams mean:`;
}
