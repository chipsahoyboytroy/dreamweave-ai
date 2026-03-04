import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-dream-border/30 bg-dream-bg/50 backdrop-blur-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dream-accent to-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-dream-text">
                DreamWeave AI
              </span>
            </div>
            <p className="text-sm text-dream-muted leading-relaxed">
              The world&apos;s first real-time multimodal dream interpreter.
              Unlock the hidden language of your subconscious.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-medium text-dream-text mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-dream-muted hover:text-dream-accent-light transition-colors">
                  Interpret a Dream
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-dream-muted hover:text-dream-accent-light transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium text-dream-text mb-4">Legal</h4>
            <ul className="space-y-2">
              <li className="text-sm text-dream-muted">
                Dream interpretations are for entertainment and self-reflection
                only. Not a substitute for professional mental health advice.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dream-border/30 text-center">
          <p className="text-xs text-dream-muted">
            &copy; {new Date().getFullYear()} DreamWeave AI. All rights reserved.
            Built with ✨ and AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
