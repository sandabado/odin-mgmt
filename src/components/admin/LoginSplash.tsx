"use client";

import { useEffect, useState } from "react";
import { LOGIN_MESSAGES } from "@/config/login-messages";
import { OdinOrbitMark } from "@/components/OdinOrbitMark";

type SplashState = "checking" | "full" | "inline" | "done";

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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setState(reducedMotion ? "inline" : "full");
    const timer = window.setTimeout(() => setState("done"), reducedMotion ? 3000 : 1500);
    return () => window.clearTimeout(timer);
  }, [userId]);

  if (state === "checking" || state === "done") return null;

  if (state === "inline") {
    return <p className="mb-5 border-l-2 border-plasma bg-plasma/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-ghost transition-opacity duration-500">Ø · {message}</p>;
  }

  return <div aria-live="polite" className="dashboard-login-splash fixed inset-0 z-[70] grid place-items-center bg-void/98 px-6 text-center">
    <div className="admin-scanlines pointer-events-none absolute inset-0" />
    <div className="relative">
      <OdinOrbitMark className="admin-orbit-mark mx-auto h-40 w-40 text-plasma drop-shadow-[0_0_34px_rgba(176,38,255,.72)] sm:h-52 sm:w-52" decorative />
      <p className="mx-auto mt-7 max-w-md font-mono text-[10px] uppercase tracking-[.16em] text-ghost">{message}</p>
      <p className="mt-10 font-mono text-[8px] uppercase tracking-[.2em] text-flux">· loading ·</p>
    </div>
  </div>;
}
