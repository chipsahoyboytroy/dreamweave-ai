"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    analytics.init();
  }, []);

  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a3e",
            color: "#e2e8f0",
            border: "1px solid #2a2a5e",
            borderRadius: "12px",
          },
          success: {
            iconTheme: {
              primary: "#7c3aed",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </SessionProvider>
  );
}
