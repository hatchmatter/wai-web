"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/libs/supabase-client";
import toast from "react-hot-toast";

import { Section, SectionDescription, SectionContent } from "@/components/ui/Section";
import { useGetUser } from "@/hooks";
import AudioPlayer from "@/components/AudioPlayer";

export type AudioInfo = {
  isPlaying: boolean;
  id: string;
}

export default function SettingsWai() {
  const supabase = createClient();
  const user = useGetUser();
  const [settings, setSettings] = useState<any>({});
  const [agents, setAgents] = useState<any[]>([]);
  const [audioPlaybackState, setAudioPlaybackState] = useState<AudioInfo>({ isPlaying: false, id: "" });

  useEffect(() => {
    if (!user) return;

    const getSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("agent_id, assistant_name")
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

  useEffect(() => {
    if (!user) return;

    const getAgents = async () => {
      const { data, error } = await supabase.from("agents").select("*");

      if (error) {
        console.error("Error fetching agents", error);
        return;
      }

      setAgents(data);
    };

    getAgents();
  }, [supabase, user]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!user) return;

    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const entries = Object.fromEntries(formData);

    const { data: _settings, error } = await supabase
      .from("settings")
      .upsert(
        {
          ...entries,
          id: user.id,
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
    <Section>
      <SectionDescription>
        <h2 className="text-base font-semibold leading-7">Wai Info</h2>
        <p className="mt-1 text-sm leading-6 ">
          Customize Wai&apos;s name and voice.
        </p>
      </SectionDescription>
      <SectionContent>  
      <form onSubmit={handleSave}>
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

          {agents.length > 0 && (
            <div className="col-span-full">
              <div className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Voice</span>
                </div>
                <ul role="list" className="divide-y divide-gray-100">
                  {agents.map((agent) => (
                    <li key={agent.id} className="flex justify-between items-center py-5">
                      <div className="flex items-center gap-x-2">
                        <input 
                          id={agent.id} 
                          type="radio" 
                          name="agent_id" 
                          className="radio radio-primary"
                          value={agent.id}
                          onChange={(e) => setSettings({ ...settings, agent_id: e.target.value })}
                          checked={settings?.agent_id === agent.id}
                        />
                        <label htmlFor={agent.id} className="text-sm font-semibold leading-6 text-gray-900 cursor-pointer">
                            {agent.name}
                        </label>
                      </div>
                      <AudioPlayer
                        agentId={agent.id}
                        audioPath={`/audio/${agent.name}.wav`}
                        playbackState={audioPlaybackState}
                        onChangePlaybackState={setAudioPlaybackState}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </div>
      </form>
      </SectionContent>
    </Section>
  );
}
