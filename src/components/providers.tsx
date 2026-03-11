"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useUserContextStore } from "@/stores/user-context-store";

function DeviceTracker({ children }: { children: React.ReactNode }) {
  const setDeviceInfo = useUserContextStore((s) => s.setDeviceInfo);
  const incrementSession = useUserContextStore((s) => s.incrementSession);

  useEffect(() => {
    setDeviceInfo(window.innerWidth);
    incrementSession();

    const handleResize = () => setDeviceInfo(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DeviceTracker>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </DeviceTracker>
    </ThemeProvider>
  );
}
