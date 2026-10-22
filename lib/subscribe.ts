export type SubscriptionSource = "launch" | "journal";

export async function submitSubscription(input: {
  email: string;
  whatsapp?: string;
  source: SubscriptionSource;
}) {
  const response = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = (await response.json().catch(() => null)) as {
    ok?: boolean;
    duplicate?: boolean;
    error?: string;
  } | null;

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error ?? "Unable to save subscription.");
  }

  return { duplicate: result.duplicate === true };
}
