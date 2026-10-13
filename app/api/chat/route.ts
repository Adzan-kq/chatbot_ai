// Proxies chat questions to an n8n webhook so the webhook URL and secret
// never reach the browser (and we avoid CORS issues with n8n).

const TIMEOUT_MS = Number(process.env.N8N_TIMEOUT_MS ?? 120_000);

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json(
      { error: "N8N_WEBHOOK_URL is not configured" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const question =
    typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    return Response.json({ error: "Question is required" }, { status: 400 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.N8N_WEBHOOK_SECRET) {
    headers[process.env.N8N_WEBHOOK_HEADER ?? "X-Webhook-Secret"] =
      process.env.N8N_WEBHOOK_SECRET;
  }

  let res: Response;
  try {
    res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ question }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === "TimeoutError";
    return Response.json(
      { error: timedOut ? "n8n took too long to respond" : "Could not reach n8n" },
      { status: timedOut ? 504 : 502 },
    );
  }

  if (!res.ok) {
    return Response.json(
      { error: `n8n responded with ${res.status}` },
      { status: 502 },
    );
  }

  const text = await res.text();
  return Response.json({ answer: extractAnswer(text) });
}

// n8n can return different shapes depending on how the workflow responds:
// { answer }, { output }, { text }, { response }, an array of items, or plain text.
function extractAnswer(raw: string): string {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return raw;
  }
  if (Array.isArray(data)) data = data[0];
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["answer", "output", "text", "response", "message"]) {
      if (typeof obj[key] === "string") return obj[key] as string;
    }
  }
  return raw;
}
