"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/libs/supabase-client";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { voiceNames } from "@/libs/wai";
import { useGetUser } from "@/hooks";

export default function SettingsWai() {
  const supabase = createClient();
  const user = useGetUser();
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    if (!user) return;

    const getSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("voice, assistant_name")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching Wai info", error); // this probably means the user doesn't have settings yet
        return;
      }

      setSettings(data);
    };

    getSettings();
  }, [supabase, user]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!user) return;

    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { voice, assistant_name } = Object.fromEntries(formData);

    const { data: _settings, error } = await supabase
      .from("settings")
      .upsert(
        {
          voice,
          id: user.id,
          assistant_name,
        },
        { onConflict: "id" }
      )
      .select();

    if (error) {
      toast.error(
        "Error saving Wai info. Please try again later or reach out to support."
      );
      console.error("Error saving Wai info", error);
      return;
    }

    toast.success("Wai info saved!");
  };

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 className="text-base font-semibold leading-7">Wai Info</h2>
        <p className="mt-1 text-sm leading-6 ">
          Customize Wai&apos;s name and voice.
        </p>
      </div>

      <form className="md:col-span-2" onSubmit={handleSave}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Name</span>
              </div>
              <input
                type="text"
                name="assistant_name"
                placeholder="Wai"
                onChange={(e) =>
                  setSettings({ ...settings, assistant_name: e.target.value })
                }
                value={settings?.assistant_name || ""}
                className="input input-bordered w-full max-w-xs"
              />
            </label>
          </div>

          <div className="col-span-full">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Voice</span>
              </div>
              <select
                className="select select-bordered"
                name="voice"
                value={settings?.voice || voiceNames[0]}
                onChange={(e) =>
                  setSettings({ ...settings, voice: e.target.value })
                }
              >
                {voiceNames.map((voice) => (
                  <option key={voice} value={voice}>
                    {voice}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          </div>
          
        </div>
      </form>
    </div>
  );
}
