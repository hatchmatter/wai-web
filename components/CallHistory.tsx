"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/libs/supabase-client";
import { format } from "date-fns";

import { Accordion, AccordionItem } from "./ui/Accordion";
import { useGetUser } from "@/hooks";

export default function CallHistory() {
  const [calls, setCalls] = useState([]);
  const supabase = createClient();
  const user = useGetUser();

  useEffect(() => {
    async function fetchCallHistory() {
      const { data, error } = await supabase
        .from("calls")
        .select("*, callers!callers_calls(*)")
        .not("transcript", "is", null)
        .order("created_at", { ascending: false })
        // .limit(10)
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching call history:", error);
        return;
      }

      setCalls(data);
    }

    if (user) {
      fetchCallHistory();
    }
  }, [user]);

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3">
      <div className="col-span-1">
        <h2 className="text-base font-semibold leading-7">
          Conversation History
        </h2>
        <p className="mt-1 text-sm leading-6 ">
          Review past conversations with Wai.
        </p>
      </div>
      <Accordion className="col-span-2">
        {calls.map((call) => (
          <AccordionItem
            key={call.id}
            title={`${format(new Date(call.created_at), "PPpp")} with ${call.callers.map((caller: any) => caller.name).join(", ")}`}
          >
            <div>
              <audio
                className="py-4 w-full"
                controls
                preload="metadata"
                src={`https://dxc03zgurdly9.cloudfront.net/${call.retell_id}/recording.wav`}
                title={`Recording of conversation with ${call.callers.map((caller: any) => caller.name).join(", ")} on ${format(new Date(call.created_at), "PPpp")}`}
              >
                <p>
                  Your browser does not support the <code>audio</code> element.
                </p>
              </audio>
              <p
                dangerouslySetInnerHTML={{
                  __html: formatTranscript(call.transcript),
                }}
              />
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function formatTranscript(transcript: any) {
  const formatted = transcript
    ?.map((t: any) => {
      return `<b>${t.role}</b>: ${t.content}\n`;
    })
    .filter(Boolean)
    .join("<br />");

  return formatted;
}
