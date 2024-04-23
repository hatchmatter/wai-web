"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/libs/supabase-client";
import toast from "react-hot-toast";

import { Section, SectionDescription, SectionContent } from "@/components/ui/Section";
import { useGetUser } from "@/hooks";

type AudioInfo = {
  isPlaying: boolean;
  agentId: string;
  src: string;
}

export default function SettingsWai() {
  const supabase = createClient();
  const user = useGetUser();
  const [settings, setSettings] = useState<any>({});
  const [agents, setAgents] = useState<any[]>([]);
  const [audioInfo, setAudioInfo] = useState<AudioInfo>({ isPlaying: false, agentId: "", src: ""});
  const audioRef = useRef(null);
  
  // clean up audio on dismount
  useEffect(() => {
    return () => {
      cleanUpAudio();
    };
  }, [])

  const cleanUpAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
  };

  const stopAudio = () => {
    cleanUpAudio();
    setAudioInfo({ isPlaying: false, agentId: "", src: ""});
  };

  const playAudio = (id: string, name: string) => {
    if (audioInfo.isPlaying && audioInfo.agentId === id)
    {
      stopAudio();
    }
    else
    {
      setAudioInfo({ isPlaying: true, agentId: id, src: "/audio/" + name + ".wav"});
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = audioInfo.src;
        audioRef.current.load();
        audioRef.current.onloadeddata = () => {
          audioRef.current.play();
        };
      }
    }
  };

  const playButton = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z" />
    </svg>
  );

  const pauseButton = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-1ZM10.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-1Z" />
    </svg>
  );

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
                      <div>
                        <button type="button" className="icon-button" onClick={() => playAudio(agent.id, agent.name)}>
                          {audioInfo.isPlaying && audioInfo.agentId === agent.id ? pauseButton : playButton}
                        </button>
                        {audioInfo.isPlaying && (
                            <audio 
                              ref={audioRef} 
                              src={audioInfo.src} 
                              onLoadedData={() => {
                                audioRef.current.play();
                              }}
                              onEnded={stopAudio}
                            />
                        )}
                      </div>
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
