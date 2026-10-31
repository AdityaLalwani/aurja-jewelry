import { NextResponse } from "next/server";
import {
  createEmailOtpChallenge,
  discardEmailOtpChallenge,
  EmailOtpError,
  generateEmailOtp,
} from "@/lib/email-otp";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function verifyTurnstile(token: string, hostname: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new EmailOtpError("CAPTCHA verification is not configured.", 503);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!response.ok) {
    throw new EmailOtpError(
      "CAPTCHA verification is temporarily unavailable. Please try again.",
      503,
    );
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new EmailOtpError(
      "CAPTCHA verification is temporarily unavailable. Please try again.",
      503,
    );
  }

  if (
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    result.success !== true ||
    !("hostname" in result) ||
    typeof result.hostname !== "string" ||
    result.hostname.toLowerCase() !== hostname.toLowerCase()
  ) {
    throw new EmailOtpError("CAPTCHA verification failed. Please try again.", 400);
  }
}

async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Email OTP delivery is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your Aurja verification code",
      text: `Your Aurja verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;color:#222"><h2>Your Aurja verification code</h2><p>Enter this code to continue:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    console.error("Resend rejected an OTP email", response.status);
    throw new Error("Email OTP delivery failed.");
  }
}

export async function POST(request: Request) {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return errorResponse("Invalid OTP request.", 400);
  }
  if (request.headers.get("origin") !== requestUrl.origin) {
    return errorResponse("Invalid OTP request.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid OTP request.", 400);
  }

  const email =
    body && typeof body === "object" && "email" in body
      ? body.email
      : undefined;
  const captchaToken =
    body && typeof body === "object" && "captchaToken" in body
      ? body.captchaToken
      : undefined;
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof captchaToken !== "string" ||
    captchaToken.length === 0 ||
    captchaToken.length > 2048
  ) {
    return errorResponse("Enter a valid email and complete the CAPTCHA.", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new EmailOtpError(
        "Email OTP is not configured: set the server-side RESEND_API_KEY.",
        503,
      );
    }
    if (!process.env.AUTH_EMAIL_FROM) {
      throw new EmailOtpError(
        "Email OTP is not configured: set AUTH_EMAIL_FROM to an address on a verified Resend domain.",
        503,
      );
    }
    await verifyTurnstile(captchaToken, requestUrl.hostname);
    const code = generateEmailOtp();
    await createEmailOtpChallenge(normalizedEmail, code);
    try {
      await sendOtpEmail(normalizedEmail, code);
    } catch (error) {
      await discardEmailOtpChallenge(normalizedEmail, code);
      throw error;
    }

    return NextResponse.json(
      {
        message:
          "If this address can receive a code, it has been sent. Check your inbox.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof EmailOtpError) {
      return errorResponse(error.message, error.status);
    }

    const isConfigurationError =
      error instanceof Error &&
      (error.message.includes("SESSION_SECRET") ||
        error.message.includes("Firebase Admin configuration") ||
        error.message.includes("FIREBASE_SERVICE_ACCOUNT_JSON") ||
        error.message.includes("NEXT_PUBLIC_FIREBASE_PROJECT_ID"));
    console.error(
      "Email OTP request failed",
      error instanceof Error ? error.message : "Unknown error",
    );

    return errorResponse(
      isConfigurationError
        ? "Email verification is not configured yet."
        : "We could not send a verification code. Please try again.",
      503,
    );
  }
}
