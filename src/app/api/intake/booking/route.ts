import { NextRequest, NextResponse } from "next/server";
import { fail, ok } from "@/lib/api-response";
import {
  clearIntakeFailures,
  clientAddress,
  hashAddress,
  recordIntakeFailure,
  sameOrigin,
  tokensMatch,
} from "@/lib/intake-security";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicIntakeSchema } from "@/lib/validators/intake.schema";

const CSRF_COOKIE = "wbr-intake-csrf";
const ROUTE = "/api/intake/booking";

async function logBlockedAttempt(
  eventType: string,
  ipHash: string,
  metadata: Record<string, string | number | boolean>,
) {
  try {
    await createSupabaseAdminClient()
      .from("security_audit_log")
      .insert({
        event_type: eventType,
        route: ROUTE,
        ip_hash: ipHash,
        metadata,
      });
  } catch (error) {
    console.error("Unable to persist intake security audit event.", error);
  }
}

export async function GET() {
  const token = crypto.randomUUID();
  const response = ok({ csrfToken: token });
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    maxAge: 30 * 60,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: NextRequest) {
  const address = clientAddress(request);
  const addressHash = await hashAddress(address);
  const rateLimit = checkRateLimit(`intake:booking:${addressHash}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    await logBlockedAttempt("intake_rate_limited", addressHash, {
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    const response = fail(
      "RATE_LIMITED",
      "Too many requests. Try again shortly.",
    );
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    return response;
  }

  if (
    !sameOrigin(request) ||
    !tokensMatch(
      request.cookies.get(CSRF_COOKIE)?.value,
      request.headers.get("x-wbr-csrf"),
    )
  ) {
    const failure = recordIntakeFailure(addressHash);
    await logBlockedAttempt("intake_csrf_rejected", addressHash, {
      challengeRequired: failure.challengeRequired,
    });
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "FORBIDDEN",
          message: failure.challengeRequired
            ? "Verification is required before another submission."
            : "The form session expired. Refresh and try again.",
        },
      },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    recordIntakeFailure(addressHash);
    return fail("VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = publicIntakeSchema.safeParse(body);
  if (!parsed.success) {
    const failure = recordIntakeFailure(addressHash);
    await logBlockedAttempt("intake_validation_rejected", addressHash, {
      challengeRequired: failure.challengeRequired,
      field: parsed.error.issues[0]?.path.map(String).join(".") ?? "unknown",
    });
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: failure.challengeRequired
            ? "Verification is required before another submission."
            : (parsed.error.issues[0]?.message ?? "Invalid submission."),
        },
      },
      { status: failure.challengeRequired ? 403 : 400 },
    );
  }

  if (parsed.data.website) {
    await logBlockedAttempt("intake_honeypot_rejected", addressHash, {});
    return ok({ accepted: true });
  }

  try {
    const submissionMessage = [
      `[Whole Body Records submission · ${parsed.data.intent}]`,
      `Best work: ${parsed.data.workUrl}`,
      parsed.data.additionalLinks
        ? `Additional links:\n${parsed.data.additionalLinks}`
        : "",
      "",
      parsed.data.message,
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await createSupabaseAdminClient()
      .from("public_intake_submissions")
      .insert({
        source: "odin_homepage",
        name: parsed.data.name,
        organization: parsed.data.artistName,
        email: parsed.data.email,
        artist_interest: parsed.data.intent,
        message: submissionMessage,
        consented_at: new Date().toISOString(),
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data)
      throw error ?? new Error("Intake record missing after insert.");
    clearIntakeFailures(addressHash);
    return ok({ accepted: true, submissionId: data.id });
  } catch (error) {
    console.error("Unable to store public intake submission.", error);
    return fail(
      "SERVER_ERROR",
      "The intake channel is unavailable. Try again shortly.",
    );
  }
}
