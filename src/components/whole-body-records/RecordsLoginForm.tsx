"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { OdinWelcomeScreen } from "@/components/OdinWelcomeScreen";
import { memberDestinationForRole } from "@/lib/auth/member-destination";
import type { OdinRole } from "@/lib/auth/roles";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { RecordsFlowMark } from "./RecordsFlowMark";

export function RecordsLoginForm() {
  const [state, setState] = useState<
    "idle" | "submitting" | "entering" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const busy = state === "submitting" || state === "entering";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createBrowserSupabaseClient();
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        setState("error");
        setMessage(result.error.message);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", result.data.user.id)
        .maybeSingle<{ role: OdinRole }>();
      if (profile?.role === "foundation_partner") {
        const { error: auditError } = await supabase.rpc(
          "log_foundation_event",
          { target_event_type: "login" },
        );
        if (auditError) {
          console.error("Foundation login audit failed", auditError);
          await supabase.auth.signOut();
          setState("error");
          setMessage(
            "Foundation access could not be audited. No private workspace was opened.",
          );
          return;
        }
      }
      const next = new URLSearchParams(window.location.search).get("next");
      const destination = memberDestinationForRole(profile?.role, next);
      if (!destination) {
        await supabase.auth.signOut();
        setState("error");
        setMessage(
          "This account has not been assigned an ØDIN member role. Submit the work or contact an operations steward for access.",
        );
        return;
      }

      setState("entering");
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      window.location.assign(destination);
    } catch (error) {
      console.error("ØDIN authentication failed", error);
      setState("error");
      setMessage(
        "ØDIN authentication is not configured yet. Add the Supabase environment values before signing in.",
      );
    }
  }

  return (
    <>
      <main className="records-auth__main" id="member-access" tabIndex={-1}>
        <section
          className="records-auth__threshold"
          aria-labelledby="records-auth-title"
        >
          <div className="records-auth__currents" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="records-auth__threshold-copy" data-records-reveal="">
            <RecordsFlowMark className="records-auth__mark" decorative />
            <p className="records-kicker">
              Whole Body Records · Members&apos; room
            </p>
            <h1 id="records-auth-title">
              The artist is
              <br />
              <em>the hero.</em>
            </h1>
            <p className="records-auth__threshold-intro">
              ØDIN is the private operating space for approved artists,
              Foundation partners, and the people supporting their work.
            </p>
            <div
              className="records-auth__principles"
              aria-label="Whole Body Records principles"
            >
              <span>Serve the field.</span>
              <span>Honor the artist.</span>
              <span>Support the flow.</span>
            </div>
          </div>
          <div className="records-auth__threshold-footer">
            <strong>Water flows for all.</strong>
            <span>Private operations · ØDIN</span>
          </div>
        </section>

        <section
          className="records-auth__access"
          data-login-form-viewport=""
          aria-labelledby="records-auth-form-title"
        >
          <div className="records-auth__form-frame" data-records-reveal="">
            <div className="records-auth__form-heading">
              <p className="records-index">Members&apos; room / ØDIN</p>
              <h2 id="records-auth-form-title">
                Welcome <em>back.</em>
              </h2>
              <p>
                Use your approved ØDIN credentials to continue to private
                operations.
              </p>
            </div>

            <form
              aria-busy={busy}
              className="records-auth__form"
              onSubmit={submit}
            >
              <label>
                <span>Email</span>
                <input
                  autoComplete="email"
                  name="email"
                  required
                  type="email"
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  autoComplete="current-password"
                  name="password"
                  required
                  type="password"
                />
              </label>
              <button
                className="records-auth__submit"
                disabled={busy}
                type="submit"
              >
                {state === "submitting"
                  ? "Checking credentials…"
                  : "Enter ØDIN"}
                {state !== "submitting" ? (
                  <span aria-hidden="true">→</span>
                ) : null}
              </button>
            </form>

            {message ? (
              <p
                aria-live={state === "error" ? "assertive" : "polite"}
                className={`records-auth__message records-auth__message--${state}`}
                role={state === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            ) : null}

            <Link className="records-auth__return" href="/">
              <span aria-hidden="true">←</span> Return to Whole Body Records
            </Link>
            <Link className="records-auth__return" href="/submit">
              Need artist access? Submit the work{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <OdinWelcomeScreen
        detail="Opening the private current."
        eyebrow="Access confirmed"
        title="Welcome back."
        visible={state === "entering"}
      />
    </>
  );
}
