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
  const { timezone, callerId } = await req.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error getting user:", userError);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }

  let caller = null;

  if (callerId) {
    const { data: callerData, error: callerError } = await supabase
      .from("callers")
      .select("*")
      .eq("id", callerId)
      .maybeSingle();

    if (callerError) {
      console.error("Error fetching caller:", callerError);
      return NextResponse.json(
        { error: "Failed to fetch caller data" },
        { status: 500 }
      );
    }

    caller = callerData;
  }

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("assistant_name, agent_id")
    .eq("id", user.id)
    .maybeSingle();

  if (settingsError) {
    console.error("Error fetching settings:", settingsError);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }

  try {
    const { call_id, access_token } = await retell.call.createWebCall({
      agent_id: settings?.agent_id || process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID,
      // metadata is sent to wss and stored in the call state
      // it's passed to tools
      metadata: {
        user: user,
        caller: caller,
        assistant_name: settings?.assistant_name || "Wai",
        timezone,
      },
    });

    const { error: callInsertError } = await supabase.from("calls").insert({
      user_id: user.id,
      retell_id: call_id,
      timezone,
      current_caller_id: callerId || null,
    });

    if (callInsertError) {
      console.error("Error inserting call record:", callInsertError);
      return NextResponse.json(
        { error: "Failed to record call" },
        { status: 500 }
      );
    }

    return NextResponse.json({ callId: call_id, accessToken: access_token });
  } catch (e) {
    console.error(
      "Unexpected error during Retell call creation or call insertion:",
      e
    );
    return NextResponse.json(
      { error: "An unexpected error occurred while setting up the call" },
      { status: 500 }
    );
  }
}
