import { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/supabase";
import { createCompletions, systemSummarizePrompt } from "@/libs/openai";

export async function POST(req: NextRequest) {
  const { event, data } = await req.json();
  const supabase = new SupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  if (event === "call_ended") {
    try {
      const completion = await createCompletions([
        systemSummarizePrompt,
        { role: "user", content: data.transcript },
      ]);

      const summary = completion.choices[0].message.content;
      const hasSummary = summary !== "null";

      const { error: callError } = await supabase
        .from("calls")
        .update({
          transcript_text: data.transcript,
          summary: hasSummary ? summary : null,
          audio_url: data.recording_url,
        })
        .eq("retell_id", data.call_id);

      if (callError) {
        throw callError;
      }
    } catch (error) {
      console.error("Problem updating call transcript: ", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({}, { status: 200 });
}
