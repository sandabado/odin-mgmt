"use client";

import { useEffect, useState } from "react";
import { LOGIN_MESSAGES } from "@/config/login-messages";
import { OdinOrbitMark } from "@/components/OdinOrbitMark";

type SplashState = "checking" | "visible" | "done";

export function LoginSplash({ userId }: { userId: string }) {
  const [state, setState] = useState<SplashState>("checking");
  const [message, setMessage] = useState<string>(LOGIN_MESSAGES[0]);

  useEffect(() => {
    setMessage(LOGIN_MESSAGES[Math.floor(Math.random() * LOGIN_MESSAGES.length)]);
    const key = `odin-dashboard-welcomed:${userId}`;
    if (window.sessionStorage.getItem(key)) {
      setState("done");
      return;
    }

    window.sessionStorage.setItem(key, "true");
    setState("visible");
    const timer = window.setTimeout(() => setState("done"), 2600);
    return () => window.clearTimeout(timer);
  }, [userId]);

  if (state === "checking" || state === "done") return null;

  return <div aria-live="polite" className="dashboard-login-splash pointer-events-none fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-[18px] border border-plasma/20 bg-carbon/90 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,.28)] backdrop-blur-xl sm:bottom-8 sm:right-8">
    <OdinOrbitMark className="admin-orbit-mark h-8 w-8 shrink-0 text-plasma" decorative />
    <div><p className="font-mono text-[8px] uppercase tracking-[.18em] text-flux">Field open</p><p className="mt-1 max-w-sm text-xs leading-5 text-ghost">{message}</p></div>
  </div>;
}
