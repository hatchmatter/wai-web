"use client";

import { useCallback, useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useWakeLock } from "react-screen-wake-lock";
import { debounce, pick, throttle } from "lodash";

import { createClient } from "@/libs/supabase-client";
import { registerCall, healthCheck } from "@/libs/wai";
import { useGetUser } from "@/hooks";

// import Visualizer from "@/components/Visualizer";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

const retell = new RetellWebClient();

type WaiProps = {
  callerId: string;
};

function Wai({ callerId }: WaiProps) {
  const user = useGetUser();
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
  const [isAgentTalking, setIsAgentTalking] = useState<boolean>(false);
  // const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [callId, setCallId] = useState<string | null>();
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<Array<{} | null>>();
  const supabase = createClient();

  const { 
    request: requestWakeLock, 
    release: releaseWakeLock 
  } = useWakeLock({
    onError: (e) => console.error("An error happened 💥", e),
  });

  const wakeLockRequest = () => {
    if (!wakeLockActive) {
      requestWakeLock();
      setWakeLockActive(true);
    }
  };

  const wakeLockRelease = () => {
    if (wakeLockActive) {
      releaseWakeLock();
      setWakeLockActive(false);
    }
  };

  // This is used to wake the heroku server on the first load
  useEffect(() => {
    const pingServer = async () => {
      try {
        await healthCheck();
      } catch (error) {
        console.error("Error pinging server: ", error);
      }
    };

    pingServer();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        //stopCall();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      stopCall();
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
    retell.on("call_started", () => {
      setIsCalling(true);
      setIsSettingUp(false);
    });

    retell.on("call_ended", () => {
      setIsCalling(false);
      // setCallId(null);
    });

    // retell.on("audio", (_audio: Uint8Array) => {
    //   // setAudioData(audio);
    // });

    retell.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false);
      retell.stopCall();
    });

    retell.on("update", (update) => {
      setTranscript(update.transcript);
    });

    retell.on("agent_start_talking", () => {
      setIsAgentTalking(true);
    });

    retell.on(
      "agent_stop_talking",
      debounce(() => {
        setIsAgentTalking(false);
      }, 500)
    );

    window.scrollTo(0, document.body.scrollHeight);
  }, [callId]);

  const startCall = async () => {
    wakeLockRequest();
    setIsSettingUp(true);

    const { callId, accessToken } = await registerCall(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      callerId,
      user?.id
    );

    if (callId) {
      setCallId(callId);

      try {
        await retell.startCall({
          accessToken,
        });
      } catch (err) {
        console.error("Error starting conversation: ", err);
      }
    }
  };

  const stopCall = () => {
    wakeLockRelease();

    retell.stopCall();
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      {!isCalling ? (
        <button
          className="btn btn-primary w-screen h-screen rounded-none text-2xl"
          onClick={startCall}
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
          onClick={stopCall}
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
