import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { getOperationsSupabase } from "@/lib/auth/operations";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactListQuerySchema, createContactSchema, validateRequestBody } from "@/lib/validators";

type ContactListItem = {
  id: string;
  name: string;
  company: string | null;
  category: string;
  email: string;
  location: string | null;
  region: string | null;
  genre_focus: string[];
  warmth_score: number;
  last_contact_date: string | null;
  next_outreach: string | null;
  tags: string[];
};

export async function GET(request: NextRequest) {
  const queryResult = contactListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!queryResult.success) {
    const issue = queryResult.error.issues[0];
    return fail("VALIDATION_ERROR", issue?.message ?? "Invalid contact filters.", issue?.path.map(String).join("."));
  }

  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;

  const { category, region, search, minWarmth } = queryResult.data;
  let requestQuery = access.supabase
    .from("contacts")
    .select("id, name, company, category, email, location, region, genre_focus, warmth_score, last_contact_date, next_outreach, tags")
    .order("warmth_score", { ascending: false })
    .limit(100);

  if (category) requestQuery = requestQuery.eq("category", category);
  if (region) requestQuery = requestQuery.eq("region", region);
  if (minWarmth !== undefined) requestQuery = requestQuery.gte("warmth_score", minWarmth);
  if (search) requestQuery = requestQuery.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, error } = await requestQuery.returns<ContactListItem[]>();
  if (error) return fail("SERVER_ERROR", "Unable to load contacts right now.");
  return ok(data ?? []);
}

export async function POST(request: NextRequest) {
  const bodyResult = await validateRequestBody(request, createContactSchema);
  if (!bodyResult.success) return bodyResult.response;

  const access = await getOperationsSupabase();
  if ("response" in access) return access.response;

  const rateLimit = checkRateLimit(`contacts:create:${access.userId}`, { limit: 30, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    const response = fail("RATE_LIMITED", "Too many contact changes. Try again shortly.");
    response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    return response;
  }

  const input = bodyResult.data;
  const { data, error } = await access.supabase.from("contacts").insert({
    name: input.name,
    company: input.company || null,
    category: input.category,
    email: input.email,
    phone: input.phone || null,
    website: input.website || null,
    instagram: input.instagram || null,
    twitter: input.twitter || null,
    linkedin: input.linkedin || null,
    location: input.location || null,
    region: input.region || null,
    genre_focus: input.genreFocus,
    tags: input.tags,
    notes: input.notes || null,
    last_contact_date: input.lastContactDate || null,
    next_outreach: input.nextOutreach || null,
  }).select().single();

  if (error) return fail("SERVER_ERROR", "Unable to create this contact right now.");
  return ok(data);
}
