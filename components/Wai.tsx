"use client";

import { useCallback, useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useWakeLock } from "react-screen-wake-lock";
import { debounce, pick, throttle } from "lodash";

import { createClient } from "@/libs/supabase-client";
import { registerCall } from "@/libs/wai";
import { useGetUser } from "@/hooks";

// import Visualizer from "@/components/Visualizer";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

const retell = new RetellWebClient();

function Wai() {
  const user = useGetUser();
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
  const [isAgentTalking, setIsAgentTalking] = useState<boolean>(false);
  // const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [callId, setCallId] = useState<string | null>();
  const [transcript, setTranscript] = useState<Array<{} | null>>();
  const supabase = createClient();

  const {
    request: requestWakeLock,
    release: releaseWakeLock,
    released,
  } = useWakeLock({
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
      stopMic();
    };
  }, []);

  useEffect(() => {
    if (callId && transcript) {
      saveTranscript(
        callId,
        transcript.map((item: any) => pick(item, ["content", "role"]))
      );
    }
  }, [transcript, callId]);

  const saveTranscript = useCallback(
    throttle(async (callId, transcript) => {
      try {
        const { error } = await supabase
          .from("calls")
          .update({
            transcript,
          })
          .eq("retell_id", callId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Error saving transcript: ", error);
      }
    }, 2000),
    []
  );

  useEffect(() => {
    retell.on("conversationEnded", () => {
      // saveTranscript();
      setIsCalling(false);
      // setCallId(null);
    });

    retell.on("conversationStarted", () => {
      setIsCalling(true);
      setIsSettingUp(false);
    });

    retell.on("audio", (audio: Uint8Array) => {
      // setAudioData(audio);
    });

    retell.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false);
    });

    retell.on("update", (update) => {
      setTranscript(update.transcript);

      const lastIndex = update.transcript.length - 1;
      const role = update.transcript[lastIndex].role;

      if (role === "agent") {
        setIsAgentTalking(true);
        handleAgentTalking();
      }
    });

    window.scrollTo(0, document.body.scrollHeight);
  }, [callId]);

  const handleAgentTalking = debounce(() => {
    setIsAgentTalking(false);
  }, 800);

  const startMic = async () => {
    requestWakeLock();
    setIsSettingUp(true);

    const { data: settings } = await supabase
      .from("settings")
      .select("agent_id, assistant_name")
      .eq("id", user?.id)
      .single();
    const { data: sessionData } = await supabase.auth.getSession();

    const registerCallResponse = await registerCall(
      settings?.agent_id || process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID,
      sessionData.session.access_token,
      Intl.DateTimeFormat().resolvedOptions().timeZone
      // TODO: add callerId here
    );

    if (registerCallResponse.callId) {
      setCallId(registerCallResponse.callId);

      try {
        await retell.startConversation({
          callId: registerCallResponse.callId,
          sampleRate: registerCallResponse.sampleRate,
          enableUpdate: true,
        });
      } catch (err) {
        console.error("Error starting conversation: ", err);
      }
    }
  };

  const stopMic = () => {
    if (!released) {
      releaseWakeLock();
    }

    retell.stopConversation();
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      {!isCalling ? (
        <button
          className="btn btn-primary w-screen h-screen rounded-none text-2xl"
          onClick={startMic}
          disabled={isSettingUp}
        >
          {isSettingUp ? (
            <span className="loading loading-infinity loading-lg w-24"></span>
          ) : (
            "Start"
          )}
        </button>
      ) : (
        <button
          className="btn btn-accent w-screen h-screen rounded-none text-2xl"
          onClick={stopMic}
        >
          {isAgentTalking ? (
            <span className="loading loading-ring loading-lg w-16"></span>
          ) : (
            "Stop"
          )}
        </button>
      )}
      {/* <Visualizer data={audioData} isActive={isCalling} /> */}
    </div>
  );
}

export default Wai;
