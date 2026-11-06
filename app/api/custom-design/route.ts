import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const MAX_REQUEST_SIZE = 4_500_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]{8,24}$/;

const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["application/pdf", ".pdf"],
]);

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function matchesFileType(type: string, bytes: Buffer) {
  if (type === "image/jpeg") {
    return bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (type === "image/webp") {
    return bytes.length >= 12 &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";
  }
  if (type === "application/pdf") {
    return bytes.length >= 5 && bytes.toString("ascii", 0, 5) === "%PDF-";
  }
  return false;
}

function safeFileName(name: string, extension: string) {
  const baseName = name
    .normalize("NFKC")
    .replace(/[\\/]/g, "_")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 100);
  const stem = baseName.replace(/\.[^.]*$/, "").slice(0, 90) || "design";
  return `${stem}${extension}`;
}

export async function POST(request: Request) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return errorResponse("The custom design service is not configured yet.", 503);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    return errorResponse("The uploaded file is too large. Please choose a file under 3 MB.", 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("Please submit the design request again with a valid file.");
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const phone = String(form.get("phone") ?? "").trim();
  const details = String(form.get("details") ?? "").trim();
  const requestId = String(form.get("requestId") ?? "").trim();
  const design = form.get("design");

  if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
    return errorResponse("Please refresh the page and submit your request again.");
  }
  if (!name || name.length > 120) {
    return errorResponse("Please enter your name.");
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return errorResponse("Please enter a valid email address.");
  }
  if (!phone || !PHONE_PATTERN.test(phone) || phone.replace(/\D/g, "").length < 8) {
    return errorResponse("Please enter a valid phone or WhatsApp number.");
  }
  if (details.length > 1500) {
    return errorResponse("Please keep your design notes under 1,500 characters.");
  }
  if (!(design instanceof File) || design.size === 0) {
    return errorResponse("Please select a design image or PDF to upload.");
  }
  if (design.size > MAX_FILE_SIZE) {
    return errorResponse("The uploaded file is too large. Please choose a file under 3 MB.", 413);
  }

  const extension = ALLOWED_TYPES.get(design.type);
  if (!extension) {
    return errorResponse("Please upload a JPG, PNG, WebP or PDF file.", 415);
  }

  const bytes = Buffer.from(await design.arrayBuffer());
  if (!matchesFileType(design.type, bytes)) {
    return errorResponse("The file contents do not match the selected file type.", 415);
  }

  const payload = {
    type: "custom-design",
    secret: webhookSecret,
    requestId,
    name,
    email,
    phone,
    details,
    file: {
      name: safeFileName(design.name, extension),
      mimeType: design.type,
      data: bytes.toString("base64"),
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const result = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;

    if (response.status === 403) {
      return errorResponse(
        "The custom design service rejected the request. Please contact us while we reconnect it.",
        502,
      );
    }
    if (!response.ok || !result?.ok) {
      console.error("Custom design webhook failed", result?.error ?? response.statusText);
      if (result?.error === "Invalid source") {
        return errorResponse(
          "The Google Apps Script deployment is outdated. Deploy a new version containing the custom-design handler, then try again.",
          502,
        );
      }
      return errorResponse("We could not send your request. Please try again or contact our atelier.", 502);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse("We could not reach the custom design service. Please try again.", 502);
  }
}
