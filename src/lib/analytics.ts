// ═══════════════════════════════════════════════════════
// DreamWeave AI — Analytics Stub (PostHog / GA compatible)
// ═══════════════════════════════════════════════════════

type EventProperties = Record<string, string | number | boolean | undefined>;

class Analytics {
  private initialized = false;

  init() {
    if (typeof window === "undefined") return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (key) {
      // PostHog init would go here in production
      // posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST })
      this.initialized = true;
    }
    console.log("[Analytics] Initialized (stub mode)");
  }

  track(event: string, properties?: EventProperties) {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${event}`, properties);
    }
    // posthog.capture(event, properties);
  }

  identify(userId: string, traits?: EventProperties) {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] Identify: ${userId}`, traits);
    }
    // posthog.identify(userId, traits);
  }

  page(name: string) {
    if (typeof window === "undefined") return;
    this.track("$pageview", { page: name });
  }
}

export const analytics = new Analytics();

// Pre-defined event names for consistency
export const EVENTS = {
  DREAM_SUBMITTED: "dream_submitted",
  DREAM_COMPLETED: "dream_completed",
  IMAGE_UPLOADED: "image_uploaded",
  VOICE_RECORDED: "voice_recorded",
  CREDITS_PURCHASED: "credits_purchased",
  DREAM_SHARED: "dream_shared",
  PRICING_VIEWED: "pricing_viewed",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_COMPLETED: "signup_completed",
} as const;
