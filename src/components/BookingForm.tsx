"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  recordsIntakePresentation,
  type RecordsIntakeIntent,
} from "@/lib/records-intake";

export function BookingForm({
  intent = "artist",
}: {
  intent?: RecordsIntakeIntent;
}) {
  const [sent, setSent] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const presentation = recordsIntakePresentation[intent];

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/intake/booking", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((result: { data?: { csrfToken?: string } }) => {
        setCsrfToken(result.data?.csrfToken ?? "");
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  async function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSending(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/intake/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wbr-csrf": csrfToken,
        },
        body: JSON.stringify({
          intent,
          name: data.get("name"),
          artistName: data.get("artistName"),
          email: data.get("email"),
          workUrl: data.get("workUrl"),
          additionalLinks: data.get("additionalLinks"),
          message: data.get("message"),
          consent: data.get("consent") === "yes",
          website: data.get("website"),
        }),
      });
      const result = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok)
        throw new Error(
          result.error?.message ?? "The request could not be sent.",
        );
      setSent(true);
      event.currentTarget.reset();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The request could not be sent.",
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <form
      className="records-submission-form"
      id="submission-form"
      onSubmit={sendRequest}
    >
      <div className="records-form-grid">
        <label>
          Your name
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          {presentation.organizationLabel}
          <input name="artistName" required autoComplete="organization" />
        </label>
      </div>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        {presentation.linkLabel}
        <input
          name="workUrl"
          type="url"
          required
          inputMode="url"
          placeholder="https://"
        />
      </label>
      <label>
        Additional links <span>(optional)</span>
        <textarea
          name="additionalLinks"
          maxLength={1200}
          rows={3}
          placeholder="Add one link per line."
        />
      </label>
      <label>
        {presentation.detailLabel}
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={3000}
          rows={5}
          placeholder={presentation.detailPlaceholder}
        />
      </label>
      <div aria-hidden="true" className="intake-honeypot">
        <label htmlFor="wbr-company-site">Company website</label>
        <input
          autoComplete="off"
          id="wbr-company-site"
          name="website"
          tabIndex={-1}
        />
      </div>
      <label className="consent">
        <input name="consent" type="checkbox" value="yes" required />
        <span>
          I consent to Whole Body Records storing this submission for human
          review.
        </span>
      </label>
      <button
        className="records-button records-button--solid"
        disabled={sending || !csrfToken}
        type="submit"
      >
        {sending ? "Sending" : presentation.button}{" "}
        <span aria-hidden="true">→</span>
      </button>
      {error ? (
        <p className="form-note form-note--error" role="alert">
          {error}
        </p>
      ) : sent ? (
        <p className="form-note" role="status">
          Your message is in the Whole Body Records review queue. A human will
          read it.
        </p>
      ) : (
        <p className="form-note">{presentation.promise}</p>
      )}
    </form>
  );
}
