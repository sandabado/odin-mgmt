"use client";

import { FormEvent, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type State =
  | "checking"
  | "ready"
  | "submitting"
  | "success"
  | "invalid"
  | "error";

export function FoundationInviteCompletionForm() {
  const [state, setState] = useState<State>("checking");
  const [message, setMessage] = useState(
    "Confirming the individual invitation…",
  );

  useEffect(() => {
    let active = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const isInviteSession =
      fragment.get("type") === "invite" &&
      fragment.has("access_token") &&
      fragment.has("refresh_token");

    if (!isInviteSession) {
      setState("invalid");
      setMessage(
        "This page requires a current individual Foundation invitation.",
      );
      return () => {
        active = false;
      };
    }

    const supabase = createBrowserSupabaseClient();

    async function confirmInvitation() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;
      if (userError || !user) {
        setState("invalid");
        setMessage(
          "This invitation is missing, expired, or already used. Ask a Foundation administrator for a new invitation.",
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle<{ role: string }>();

      if (!active) return;
      if (profileError || profile?.role !== "foundation_partner") {
        await supabase.auth.signOut();
        setState("invalid");
        setMessage(
          "This identity is not linked to an active Foundation invitation.",
        );
        return;
      }

      // Remove implicit-flow credentials from browser history immediately
      // after the Supabase client has stored the authenticated session.
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
      setState("ready");
      setMessage(
        "Identity confirmed. Choose a private password to finish opening the partner workspace.",
      );
    }

    void confirmInvitation();
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");

    if (password.length < 12) {
      setState("error");
      setMessage("Use at least 12 characters for this private account.");
      return;
    }
    if (password !== confirmation) {
      setState("error");
      setMessage("The password confirmation does not match.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });
    if (passwordError) {
      setState("error");
      setMessage(passwordError.message);
      return;
    }

    const { error: auditError } = await supabase.rpc(
      "log_foundation_event",
      { target_event_type: "login" },
    );
    if (auditError) {
      console.error("Foundation invitation audit failed", auditError);
      await supabase.auth.signOut();
      setState("error");
      setMessage(
        "The password was saved, but Foundation access could not be audited. Sign in again after an administrator checks the workspace.",
      );
      return;
    }

    setState("success");
    setMessage("Invitation complete. Opening the private Foundation room…");
    window.location.assign("/foundation");
  }

  const showForm =
    state === "ready" || state === "error" || state === "submitting";

  return (
    <main className="min-h-screen bg-void px-5 py-16 text-bone sm:px-8">
      <section className="mx-auto max-w-xl border border-mercury bg-carbon p-7 sm:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[.16em] text-plasma">
          ØDIN / Whole Body Foundation
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none">
          Complete your
          <br />
          private invitation.
        </h1>
        <p
          aria-live={state === "error" ? "assertive" : "polite"}
          className="mt-5 text-sm leading-7 text-ghost"
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>

        {showForm ? (
          <form className="mt-8 grid gap-4" onSubmit={submit}>
            <label className="grid gap-2 text-xs text-ghost">
              Private password
              <input
                autoComplete="new-password"
                className="border border-steel bg-void p-3 text-bone"
                minLength={12}
                name="password"
                required
                type="password"
              />
            </label>
            <label className="grid gap-2 text-xs text-ghost">
              Confirm password
              <input
                autoComplete="new-password"
                className="border border-steel bg-void p-3 text-bone"
                minLength={12}
                name="confirmation"
                required
                type="password"
              />
            </label>
            <button
              className="mt-2 border border-flux bg-flux p-3 font-mono text-[9px] uppercase tracking-[.12em] text-void"
              disabled={state === "submitting"}
              type="submit"
            >
              {state === "submitting"
                ? "Securing account…"
                : "Enter the partner workspace"}
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
