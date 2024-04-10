"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/libs/supabase-client";
import { format } from "date-fns";

import {
  Accordion,
  AccordionItem,
  Section,
  SectionContent,
  SectionDescription,
} from "@/components/ui";
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
    <Section>
      <SectionDescription>
        <h2 className="text-base font-semibold leading-7">
          Conversation History
        </h2>
        <p className="mt-1 text-sm leading-6 ">
          Review past conversations with Wai.
        </p>
      </SectionDescription>
      <SectionContent>
        <Accordion>
          {calls.map((call) => (
            <AccordionItem
              key={call.id}
              title={`${format(new Date(call.created_at), "PPpp")} with ${call.callers.map((caller: any) => caller.name).join(", ")}`}
            >
              <div>
                <div className="py-4">
                  {process.env.NODE_ENV !== 'development' ? (<audio
                    className="w-full h-6"
                    controls
                    preload="metadata"
                    src={`https://dxc03zgurdly9.cloudfront.net/${call.retell_id}/recording.wav`}
                    title={`Recording of conversation with ${call.callers.map((caller: any) => caller.name).join(", ")} on ${format(new Date(call.created_at), "PPpp")}`}
                  >
                    <p>
                      Your browser does not support the <code>audio</code>{" "}
                      element.
                    </p>
                  </audio>) : "no audio in dev"}
                </div>
                <p
                  dangerouslySetInnerHTML={{
                    __html: formatTranscript(call.transcript),
                  }}
                />
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
    </Section>
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
