"use client";

import { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useWakeLock } from "react-screen-wake-lock";

import { createClient } from "@/libs/supabase-client";
import { registerCall } from "@/libs/wai";
import { useGetUser } from "@/hooks";

import Visualizer from "@/components/Visualizer";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

const retell = new RetellWebClient();

function Wai() {
  const user = useGetUser();
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const supabase = createClient();

  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock({
    // onRequest: () => console.log("Screen Wake Lock: requested!"),
    onError: (e) => console.error("An error happened 💥", e),
    // onRelease: () => console.log("Screen Wake Lock: released!"),
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopMic();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Initialize the SDK
  useEffect(() => {
    // Setup event listeners
    retell.on("conversationStarted", () => {
      requestWakeLock();
      setIsCalling(true);
      setIsSettingUp(false);
      // console.log("conversationStarted");
    });

    retell.on("audio", (audio: Uint8Array) => {
      // console.log("There is audio", audio);
      setAudioData(audio);
    });

    retell.on("conversationEnded", ({ code, reason }) => {
      releaseWakeLock();
      setIsCalling(false);
    });

    retell.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false);
    });

    // retell.on("update", (update) => {
    // prints transcript
    // console.log("update", update);
    // });
  }, []);

  const startMic = async () => {
    setIsSettingUp(true);

    const { data: settings } = await supabase
      .from("settings")
      .select("agent_id, assistant_name")
      .eq("id", user?.id)
      .single();

    const registerCallResponse = await registerCall(
      settings?.agent_id || process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID,
      settings?.assistant_name || "Wai"
    );

    if (registerCallResponse.callId) {
      try {
        await retell.startConversation({
          callId: registerCallResponse.callId,
          sampleRate: registerCallResponse.sampleRate,
          // enableUpdate: true,
        });
      } catch (err) {
        console.error("Error starting conversation: ", err);
      }
    }
  };

  const stopMic = () => {
    retell.stopConversation();
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      {!isCalling ? (
        <button
          className="btn btn-circle btn-lg btn-primary w-36 h-36"
          onClick={startMic}
          disabled={isSettingUp}
        >
          {isSettingUp ? (
            <span className="loading loading-ring loading-lg w-24"></span>
          ) : (
            "Start"
          )}
        </button>
      ) : (
        <button
          className="btn btn-circle btn-lg btn-secondary w-36 h-36"
          onClick={stopMic}
        >
          Stop
        </button>
      )}
      <Visualizer data={audioData} isActive={isCalling} />
    </div>
  );
}

export default Wai;
