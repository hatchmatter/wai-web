interface RegisterCallResponse {
  callId?: string;
  sampleRate?: number;
}

export async function registerCall(
  agentId: string,
  accessToken: string,
  timezone?: string,
  callerId?: string
): Promise<RegisterCallResponse> {
  const headers = new Headers();

  headers.append("Content-Type", "application/json");

  const response = await fetch(`/api/call/register`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      agentId,
      timezone,
      callerId
    }),
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} - ${response.statusText}`);
    return {};
  }

  return await response.json();
}
