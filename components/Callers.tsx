"use client";

import React, { useEffect, useState, useRef, forwardRef } from "react";

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

export default function Callers() {
  const supabase = createClient();
  const [callers, setCallers] = useState([]);
  const [lastCall, setLastCall] = useState(null);
  const [selectedCaller, setSelectedCaller] = useState(null);
  const editDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
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
        .maybeSingle();

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

  const handleRemoveCaller = async (caller: any) => {
    const { error } = await supabase
      .from("callers")
      .delete()
      .eq("id", caller.id);

    if (error) {
      console.error("Error removing caller:", error);
      return;
    }

    setCallers((prev) => prev.filter((c) => c.id !== caller.id));
  };

  const handleSaveCallerName = async (caller: any) => {
    const { error } = await supabase
      .from("callers")
      .update({ name: caller.name })
      .eq("id", caller.id);

    if (error) {
      console.error("Error updating caller name:", error);
      return;
    }

    setCallers((prev) =>
      prev.map((c) => {
        if (c.id === caller.id) {
          return { ...c, name: caller.name };
        }

        return c;
      })
    );
  };

  const isLastCaller = (callerId: string) => {
    return lastCall?.current_caller_id === callerId;
  };

  return (
    <Section>
      <SectionDescription>
        <h2 className="text-base font-semibold leading-7">People</h2>
        <p className="mt-1 text-sm leading-6">
          View and edit previous people who&apos;ve spoken to Wai.
        </p>
      </SectionDescription>
      <SectionContent>
        <Accordion>
          {callers.map((caller) => (
            <AccordionItem
              onClick={() => setSelectedCaller(caller)}
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
                {caller.preferences && (
                  <>
                    <p className="text-sm font-semibold leading-6">
                      Preferences
                    </p>
                    <div className="mt-1 truncate text-xs leading-5">
                      {Object.keys(caller.preferences).map((p) => {
                        return (
                          <p key={p}>{`${p}: ${caller.preferences[p]}`}</p>
                        );
                      })}
                    </div>
                  </>
                )}
                <div>
                  <div className="mt-4 flex justify-end gap-4">
                    <button
                      className=""
                      onClick={() => {
                        editDialogRef.current?.showModal();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-red-400"
                      onClick={() => {
                        deleteDialogRef.current?.showModal();
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
                  </div>
                </div>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
      {selectedCaller && (
        <>
          <EditDialog
            ref={editDialogRef}
            caller={selectedCaller}
            onConfirm={handleSaveCallerName}
          />
          <DeleteDialog
            ref={deleteDialogRef}
            caller={selectedCaller}
            onConfirm={handleRemoveCaller}
          />
        </>
      )}
    </Section>
  );
}

type DialogProps = {
  caller: any;
  onConfirm: (caller: any) => void;
};

const EditDialog = forwardRef(function EditDialog(
  { caller, onConfirm }: DialogProps,
  ref: React.Ref<HTMLDialogElement>
) {
  const [name, setName] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <Dialog ref={ref}>
      <div className="modal-content">
        <h3 className="font-bold text-lg">Edit person</h3>
        <p className="py-4">
          Name
        </p>
        <input
          type="text"
          value={name}
          placeholder={caller.name}
          onChange={handleNameChange}
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <div className="modal-action">
        <form method="dialog" className="flex gap-x-2">
          <button className="btn btn-sm">Cancel</button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              if (name.trim() === "") {
                return;
              }

              setName("");
              onConfirm({ ...caller, name })
            }}
          >
            Save
          </button>
        </form>
      </div>
    </Dialog>
  );
});

const DeleteDialog = forwardRef(function DeleteDialog(
  { caller, onConfirm }: DialogProps,
  ref: React.Ref<HTMLDialogElement>
) {
  return (
    <Dialog ref={ref}>
      <div className="modal-content">
        <h3 className="font-bold text-lg text-error">Remove {caller.name}</h3>
        <p className="py-4">
          Are you sure you want to remove <b>{caller.name}</b>? This action
          cannot be undone and you will lose their data. You can also simply
          change their name.
        </p>
      </div>
      <div className="modal-action">
        <form method="dialog" className="flex gap-x-2">
          <button className="btn btn-sm btn-primary">Cancel</button>
          <button className="btn btn-sm" onClick={() => onConfirm(caller)}>
            Confirm
          </button>
        </form>
      </div>
    </Dialog>
  );
});
