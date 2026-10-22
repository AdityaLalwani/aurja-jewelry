import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]{10,20}$/;
const SOURCES = new Set(["launch", "journal"]);

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return errorResponse("Subscription service is not configured.", 503);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse("Invalid request body.");
  }

  if (!payload || typeof payload !== "object") {
    return errorResponse("Invalid request body.");
  }

  const body = payload as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const source = typeof body.source === "string" ? body.source : "";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return errorResponse("Please enter a valid email address.");
  }
  if (whatsapp && (!PHONE_PATTERN.test(whatsapp) || whatsapp.replace(/\D/g, "").length < 10)) {
    return errorResponse("Please enter a valid WhatsApp number.");
  }
  if (!SOURCES.has(source)) {
    return errorResponse("Invalid subscription source.");
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, whatsapp, source, secret: webhookSecret }),
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as {
      ok?: boolean;
      duplicate?: boolean;
      error?: string;
    } | null;

    if (response.status === 403) {
      return errorResponse(
        "Google Sheets webhook rejected the request. Redeploy the Apps Script as a web app with access set to Anyone, then update GOOGLE_SHEETS_WEBHOOK_URL.",
        502,
      );
    }

    if (!response.ok || !result?.ok) {
      return errorResponse(result?.error ?? "Unable to save subscription.", response.ok ? 502 : response.status);
    }

    return NextResponse.json({ ok: true, duplicate: result.duplicate === true });
  } catch {
    return errorResponse("Unable to reach the subscription service.", 502);
  }
}
