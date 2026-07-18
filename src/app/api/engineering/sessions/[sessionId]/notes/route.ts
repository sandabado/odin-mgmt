import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateRequestBody } from "@/lib/validators";

const noteSchema = z.object({ title: z.string().trim().max(180).optional(), content: z.string().trim().min(1).max(10_000), important: z.boolean().optional(), requiresResponse: z.boolean().optional() });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  if (!uuid.test(sessionId)) return fail("VALIDATION_ERROR", "Invalid session identifier.", "sessionId");
  const body = await validateRequestBody(request, noteSchema);
  if (!body.success) return body.response;
  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;
  const limit = checkRateLimit(`session:notes:${access.userId}`, { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) return fail("RATE_LIMITED", "Too many notes. Try again shortly.");
  const { data: profile } = await access.supabase.from("profiles").select("role").eq("id", access.userId).maybeSingle();
  const authorRole = profile?.role === "super_admin" ? "admin" : "producer";
  const { data: session } = await access.supabase.from("engineering_sessions").select("id").eq("id", sessionId).maybeSingle();
  if (!session) return fail("NOT_FOUND", "Session not found.");
  const { data, error } = await access.supabase.from("session_notes").insert({ session_id: sessionId, author_id: access.userId, author_role: authorRole, title: body.data.title || null, content: body.data.content, is_important: Boolean(body.data.important), requires_response: Boolean(body.data.requiresResponse) }).select().single();
  if (error) return fail("SERVER_ERROR", "Unable to add session note right now.");
  return ok(data);
}
