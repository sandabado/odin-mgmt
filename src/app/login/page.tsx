"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createBrowserSupabaseClient();
      const result = mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });

      if (result.error) {
        setState("error");
        setMessage(result.error.message);
        return;
      }

      if (mode === "sign-in") {
        window.location.assign("/admin");
        return;
      }

      setState("success");
      setMessage("Check your email to confirm your Odin account, then return here to sign in.");
    } catch (error) {
      console.error("Odin authentication failed", error);
      setState("error");
      setMessage("Odin authentication is not configured yet. Add the Supabase environment values before signing in.");
    }
  }

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden border border-mercury md:grid-cols-[.9fr_1.1fr]"><section className="relative flex min-h-72 flex-col justify-between overflow-hidden border-b border-mercury bg-[radial-gradient(circle_at_70%_20%,rgba(176,38,255,.28),transparent_34%),linear-gradient(135deg,#0A0A0F,#050505)] p-7 md:min-h-0 md:border-r md:border-b-0 md:p-10"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-plasma">Odin Management · private operations</p><div><p className="font-display text-5xl leading-[.88] sm:text-6xl">Protect the<br /><span className="text-plasma">signal.</span></p><p className="mt-6 max-w-sm text-sm leading-6 text-ghost">Access is for Odin&apos;s booking team and approved artist partners. Every session is role-aware and logged through the operating system.</p></div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-ghost">Whole Body Records / secure field</p></section><section className="flex items-center bg-carbon p-7 sm:p-10"><div className="w-full max-w-md"><div className="flex border border-mercury text-[10px] font-bold uppercase tracking-[.14em]"><button type="button" className={`flex-1 px-4 py-3 ${mode === "sign-in" ? "bg-steel text-bone" : "text-ghost"}`} onClick={() => { setMode("sign-in"); setState("idle"); setMessage(""); }}>Sign in</button><button type="button" className={`flex-1 border-l border-mercury px-4 py-3 ${mode === "register" ? "bg-steel text-bone" : "text-ghost"}`} onClick={() => { setMode("register"); setState("idle"); setMessage(""); }}>Request access</button></div><h1 className="mt-10 font-display text-4xl leading-none">{mode === "sign-in" ? "Welcome back." : "Enter the field."}</h1><p className="mt-4 text-sm leading-6 text-ghost">{mode === "sign-in" ? "Use your Odin credentials to continue to operations." : "The first confirmed account is assigned super-admin access. Future roles are set by an administrator."}</p><form className="mt-8 grid gap-5" onSubmit={submit}><label className="grid gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-ghost">Email<input className="border border-mercury bg-void px-4 py-3 text-sm text-bone outline-none transition focus:border-plasma" type="email" name="email" required autoComplete="email" /></label><label className="grid gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-ghost">Password<input className="border border-mercury bg-void px-4 py-3 text-sm text-bone outline-none transition focus:border-plasma" type="password" name="password" minLength={12} required autoComplete={mode === "sign-in" ? "current-password" : "new-password"} /></label><button className="border border-plasma bg-plasma px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-void transition hover:bg-transparent hover:text-plasma disabled:cursor-wait disabled:opacity-60" disabled={state === "submitting"} type="submit">{state === "submitting" ? "Checking credentials…" : mode === "sign-in" ? "Enter operations →" : "Create secure account →"}</button></form>{message ? <p className={`mt-5 border-l-2 pl-3 text-sm leading-6 ${state === "success" ? "border-flux text-flux" : "border-plasma text-bone"}`}>{message}</p> : null}</div></section></div></main>;
}
