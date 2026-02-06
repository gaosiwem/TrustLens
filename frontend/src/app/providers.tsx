"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SessionValidator } from "../components/SessionValidator";
import { Toaster } from "sonner";
import { SubscriptionProvider } from "../context/SubscriptionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <SubscriptionProvider>
            <SessionValidator />
            {children}
            <Toaster position="top-right" richColors />
          </SubscriptionProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
