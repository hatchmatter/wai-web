interface RegisterCallResponse {
  callId?: string;
  sampleRate?: number;
}

type VoiceName = "shimmer" | "echo" | "paola" | "onyx";

type Voice = {
  [key in VoiceName]: {
    agentId: string;
  };
};

const isDev = process.env.NODE_ENV === "development";

const voices: Voice = {
  shimmer: {
    agentId: isDev
      ? "3af24d4268ee5bb0981827f04bbc71dc"
      : "ddbe39893ffc8684a4c2d95b0265320c",
  },
  echo: {
    agentId: isDev
      ? "22b18ea191b9c3060217b5e745d075ba"
      : "c04563f395d5081489d62188929cebf7",
  },
  paola: {
    agentId: isDev
      ? "7d45697beaf8740e92bc163c72f71e2b"
      : "fff1805f63c926f94750a95c5a480009",
  },
  onyx: {
    agentId: isDev
      ? "75f5073840d895e63bc452854b9b7c7b"
      : "5a35b831175208bef88102a1df39b5a2",
  },
};

export const voiceNames = Object.keys(voices) as VoiceName[];

export async function registerCall(
  voice: VoiceName
): Promise<RegisterCallResponse> {
  const { agentId } = voices[voice];
  const headers = new Headers();

  headers.append("Content-Type", "application/json");

  const response = await fetch(`${process.env.NEXT_PUBLIC_WSS_URL}/register`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      agentId
    }),
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} - ${response.statusText}`);
    return {};
  }

  return await response.json();
}
