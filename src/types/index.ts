// ═══════════════════════════════════════════════════════
// DreamWeave AI — Core Types
// ═══════════════════════════════════════════════════════

export interface DreamInput {
  text: string;
  mood?: string;
  imageBase64?: string;
  audioBase64?: string;
}

export interface DreamResult {
  id: string;
  interpretation: string;
  story: string;
  archetypes: string[];
  emotions: string[];
  themes: string[];
  generatedImageUrl?: string;
  audioNarrationUrl?: string;
  summary: string;
  createdAt: string;
}

export interface StreamingDreamResult {
  type:
    | "interpretation"
    | "story"
    | "archetypes"
    | "image"
    | "audio"
    | "summary"
    | "error"
    | "done"
    | "credit_update";
  content: string;
}

export interface UserCredits {
  credits: number;
  tier: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  priceId: string;
  popular?: boolean;
}

export interface DreamArchetype {
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const DREAM_ARCHETYPES: Record<string, DreamArchetype> = {
  "The Shadow": {
    name: "The Shadow",
    icon: "🌑",
    description: "Hidden aspects of your psyche seeking integration",
    color: "from-gray-600 to-gray-900",
  },
  "The Anima": {
    name: "The Anima",
    icon: "🌙",
    description: "The feminine principle within — creativity, intuition",
    color: "from-purple-500 to-pink-500",
  },
  "The Animus": {
    name: "The Animus",
    icon: "☀️",
    description: "The masculine principle — logic, assertiveness",
    color: "from-amber-500 to-orange-500",
  },
  "The Self": {
    name: "The Self",
    icon: "✨",
    description: "Wholeness, spiritual center, individuation",
    color: "from-violet-500 to-indigo-500",
  },
  "The Hero": {
    name: "The Hero",
    icon: "⚔️",
    description: "Courage, overcoming obstacles, transformation",
    color: "from-red-500 to-yellow-500",
  },
  "The Trickster": {
    name: "The Trickster",
    icon: "🃏",
    description: "Chaos, humor, breaking conventions",
    color: "from-green-400 to-cyan-500",
  },
  "The Mother": {
    name: "The Mother",
    icon: "🌿",
    description: "Nurturing, protection, creation",
    color: "from-emerald-500 to-teal-500",
  },
  "The Wise Old One": {
    name: "The Wise Old One",
    icon: "🦉",
    description: "Wisdom, guidance, knowledge from the depths",
    color: "from-blue-500 to-indigo-700",
  },
  "The Child": {
    name: "The Child",
    icon: "🌸",
    description: "Innocence, new beginnings, potential",
    color: "from-pink-400 to-rose-500",
  },
  "The Water": {
    name: "The Water",
    icon: "🌊",
    description: "Emotions, the unconscious, flowing change",
    color: "from-cyan-500 to-blue-600",
  },
  "The Flight": {
    name: "The Flight",
    icon: "🕊️",
    description: "Freedom, transcendence, new perspectives",
    color: "from-sky-400 to-indigo-400",
  },
  "The Labyrinth": {
    name: "The Labyrinth",
    icon: "🌀",
    description: "Journey inward, complexity, finding your path",
    color: "from-fuchsia-500 to-purple-700",
  },
};

export const MOOD_OPTIONS = [
  { value: "calm", label: "Calm 😌", emoji: "😌" },
  { value: "anxious", label: "Anxious 😰", emoji: "😰" },
  { value: "curious", label: "Curious 🤔", emoji: "🤔" },
  { value: "melancholic", label: "Melancholic 🥀", emoji: "🥀" },
  { value: "euphoric", label: "Euphoric 🌟", emoji: "🌟" },
  { value: "fearful", label: "Fearful 😨", emoji: "😨" },
  { value: "nostalgic", label: "Nostalgic 💭", emoji: "💭" },
  { value: "confused", label: "Confused 😵‍💫", emoji: "😵‍💫" },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    credits: 1,
    features: [
      "1 free dream interpretation",
      "Full Jungian archetype analysis",
      "AI story continuation",
      "Shareable Dream Cards",
      "Dream history",
    ],
    priceId: "",
  },
  {
    id: "starter",
    name: "Lucid Starter",
    price: 4.99,
    credits: 15,
    features: [
      "15 dream credits",
      "Everything in Free Trial",
      "Generated dream art",
      "Audio narration",
      "Priority generation",
    ],
    priceId: "STRIPE_PRICE_STARTER",
    popular: true,
  },
  {
    id: "explorer",
    name: "Dream Explorer",
    price: 9.99,
    credits: 40,
    features: [
      "40 dream credits",
      "Everything in Starter",
      "HD dream art",
      "Extended story mode",
      "Dream pattern analysis",
    ],
    priceId: "STRIPE_PRICE_EXPLORER",
  },
  {
    id: "visionary",
    name: "Visionary",
    price: 19.99,
    credits: 100,
    features: [
      "100 dream credits",
      "Everything in Explorer",
      "Ultra-HD art (4 variations)",
      "Custom voice selection",
      "API access",
      "Early access to features",
    ],
    priceId: "STRIPE_PRICE_VISIONARY",
  },
];
