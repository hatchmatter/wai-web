"use client";

import { useEffect, useState, useRef } from "react";

import { createClient } from "@/libs/supabase-client";
import {
  Section,
  SectionDescription,
  SectionContent,
  Accordion,
  AccordionItem,
  Dialog,
} from "@/components/ui";
import { useGetUser } from "@/hooks";
import { update } from "lodash";

export default function Callers() {
  const supabase = createClient();
  const [callers, setCallers] = useState([]);
  const [lastCall, setLastCall] = useState(null);
  const dialogRef = useRef(null);
  const user = useGetUser();

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("callers")
        .select("*")
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching callers:", error);
        return;
      }

      const { data: lastCall, error: callsError } = await supabase
        .from("calls")
        .select("*")
        .eq("user_id", user.id)
        .not("current_caller_id", "is", null)
        .order("ended_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching last call:", error);
        return;
      }

      setCallers(data);
      setLastCall(lastCall);
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleRemoveCaller = async (callerId: string) => {
    const { error } = await supabase
      .from("callers")
      .delete()
      .eq("id", callerId);

    if (error) {
      console.error("Error removing caller:", error);
      return;
    }

    setCallers((prev) => prev.filter((c) => c.id !== callerId));
  };

  const isLastCaller = (callerId: string) => {
    return lastCall?.current_caller_id === callerId;
  };

  return (
    <Section>
      <SectionDescription>
        <h2 className="text-base font-semibold leading-7">People</h2>
        <p className="mt-1 text-sm leading-6">
          View and edit previous people who've spoken to Wai.
        </p>
      </SectionDescription>
      <SectionContent>
        <Accordion>
          {callers.map((caller) => (
            <AccordionItem
              key={caller.id}
              title={
                <div className="flex items-center justify-between">
                  <div>{caller.name}</div>
                  {isLastCaller(caller.id) && (
                    <div
                      className="badge badge-info badge-sm"
                      title="Last person spoken with"
                    >
                      spoke last
                    </div>
                  )}
                </div>
              }
            >
              <div className="mt-2">
                <p className="text-sm font-semibold leading-6">Preferences</p>
                <div className="mt-1 truncate text-xs leading-5">
                  {Object.keys(caller.preferences || []).map((p) => {
                    return <p key={p}>{`${p}: ${caller.preferences[p]}`}</p>;
                  })}
                </div>
                <div>
                  <div className="mt-10 flex justify-end">
                    <button
                      className="text-red-400"
                      onClick={() => {
                        dialogRef.current?.showModal();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                    <Dialog ref={dialogRef}>
                      <div className="modal-content">
                        <h3 className="font-bold text-lg">
                          Remove {caller.name}
                        </h3>
                        <p className="py-4">
                          Are you sure you want to remove <b>{caller.name}</b>? This action cannot be undone and you will lose their data. You can also simply change their name.
                        </p>
                      </div>
                      <div className="modal-action">
                        <form method="dialog" className="flex gap-x-2">
                          <button className="btn btn-sm btn-primary">Cancel</button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleRemoveCaller(caller.id)}
                          >
                            Confirm
                          </button>
                        </form>
                      </div>
                    </Dialog>
                  </div>
                </div>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
    </Section>
  );
}
