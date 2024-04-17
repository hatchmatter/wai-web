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
  headers.append("Authorization", `Bearer ${accessToken}`)

  const response = await fetch(`${process.env.NEXT_PUBLIC_WSS_URL}/register`, {
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
