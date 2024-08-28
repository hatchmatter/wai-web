import { createClient } from "@/libs/supabase-server";
import Retell from "retell-sdk";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.RETELL_API_KEY) {
  throw new Error("RETELL_API_KEY is not defined");
}

const retell = new Retell({
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

    const { data: caller, error: callerError } = await supabase
      .from("callers")
      .select("*")
      .eq("id", callerId)
      .single();

    if (callerError) {
      throw callerError;
    }

    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("assistant_name")
      .eq("id", user.id)
      .maybeSingle();

    if (settingsError) {
      throw settingsError;
    }

    const { call_id } = await retell.call.createWebCall({
      agent_id: agentId,
      // metadata is sent to wss and stored in the call state
      // it's passed to tools
      metadata: {
        user: user,
        caller: caller,
        assistant_name: settings?.assistant_name,
        timezone,
      },
    });

    const { error: callError } = await supabase.from("calls").insert({
      user_id: user.id,
      retell_id: call_id,
      timezone,
      current_caller_id: callerId,
    });

    if (callError) {
      throw callError;
    }

    return NextResponse.json({ callId: call_id, sampleRate: sample_rate });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to register call" },
      { status: 500 }
    );
  }
}
