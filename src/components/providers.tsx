"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/toaster";
import { UnreadPoller } from "@/components/unread-poller";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PwaProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <UnreadPoller />
          {children}
          <InstallPrompt />
          <Toaster />
        </ThemeProvider>
      </PwaProvider>
    </SessionProvider>
  );
}
