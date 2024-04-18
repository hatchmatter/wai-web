import { createClient } from "@/libs/supabase-server";
import {
  AudioWebsocketProtocol,
  AudioEncoding,
} from "retell-sdk/models/components";
import { RetellClient } from "retell-sdk";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.RETELL_API_KEY) {
  throw new Error("RETELL_API_KEY is not defined");
}

const retell = new RetellClient({
  apiKey: process.env.RETELL_API_KEY,
});

export async function POST(req: NextRequest) {
  const { agentId, timezone, callerId } = await req.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { callDetail } = await retell.registerCall({
      agentId,
      audioWebsocketProtocol: AudioWebsocketProtocol.Web,
      audioEncoding: AudioEncoding.S16le,
      sampleRate: 24000,
    });

    const { error: callError } = await supabase.from("calls").insert({
      user_id: user.id,
      retell_id: callDetail.callId,
      timezone,
      current_caller_id: callerId,
    });

    if (callError) {
      throw callError;
    }

    return NextResponse.json(callDetail);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to register call" }, { status: 500 });
  }
};
