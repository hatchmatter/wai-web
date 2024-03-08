interface RegisterCallResponse {
  callId?: string;
  sampleRate?: number;
}

const agentId: string = "ddbe39893ffc8684a4c2d95b0265320c";

export async function registerCall(): Promise<RegisterCallResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WSS_URL}/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agentId,
      }),
    }
  );

  if (!response.ok) {
    console.error(`Error: ${response.status} - ${response.statusText}`);
    return {};
  }

  return await response.json();
}