interface RegisterCallResponse {
  callId?: string;
  sampleRate?: number;
}

const headers = new Headers();
headers.append("Content-Type", "application/json");

if (process.env.NODE_ENV === "development") {
  headers.append("ngrok-skip-browser-warning", "true");
}

export async function registerCall(
  agentId: string,
  timezone?: string,
  callerId?: string
): Promise<RegisterCallResponse> {
  const response = await fetch(`/api/call/register`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      agentId,
      timezone,
      callerId,
    }),
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} - ${response.statusText}`);
    return {};
  }

  return await response.json();
}

export async function healthCheck() {
  const response = await fetch(process.env.NEXT_PUBLIC_WSS_URL + "/_health", {
    headers,
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} - ${response.statusText}`);
    return {};
  }

  return await response.json();
}
