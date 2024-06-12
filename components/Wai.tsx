"use client";

import { useCallback, useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useWakeLock } from "react-screen-wake-lock";
import { debounce, pick, throttle } from "lodash";

import { createClient } from "@/libs/supabase-client";
import { registerCall,  healthCheck } from "@/libs/wai";
import ImageGenerator from "@/components/ImageGenerator";
import { useGetUser } from "@/hooks";

// import Visualizer from "@/components/Visualizer";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

const retell = new RetellWebClient();

type WaiProps = { 
  callerId: string
}

function Wai({callerId}: WaiProps) {
  const user = useGetUser();
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
  const [isAgentTalking, setIsAgentTalking] = useState<boolean>(false);
  const [isStoryMode, setIsStoryMode] = useState<boolean>(true);
  const [storyTranscript, setStoryTranscript] = useState<string[]>([]);
  // const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [callId, setCallId] = useState<string | null>();
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<Array<{} | null>>();
  const supabase = createClient();

  const { 
    request: requestWakeLock, 
    release: releaseWakeLock 
  } = useWakeLock({
    //onRequest: () => console.log("Screen Wake Lock: requested!"),
    onError: (e) => console.error("An error happened 💥", e),
    //onRelease: () => console.log("Screen Wake Lock: released!"),
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
      if (update.event_type === "metadata") {
        // if (update.metadata.story_mode !== isStoryMode) {
        //   //console.log(update);
        //   setIsStoryMode(update.metadata.story_mode);
        // }
        if (update.metadata.transcript) {
          updateStoryTranscript(update.metadata.transcript, update.metadata.new_story);
        }
      } else {
        setTranscript(update.transcript);

        const lastIndex = update.transcript.length - 1;
        const role = update.transcript[lastIndex].role;

        if (role === "agent") {
          setIsAgentTalking(true);
          handleAgentTalking();
        }
      }
    });

    window.scrollTo(0, document.body.scrollHeight);
  }, [callId]);

  const updateStoryTranscript = (transcript: any, newStory: any) => {
    //if (newStory) console.log("New Story");
    setStoryTranscript((prevStoryTranscript) => {
      if (newStory) {
        return [transcript];
      } else {
        if (prevStoryTranscript[prevStoryTranscript.length - 1] === transcript) {
          return prevStoryTranscript;
        } else {
          return [...prevStoryTranscript, transcript];
        }
      }
    });
    //console.log(transcript);
  };

  const handleAgentTalking = debounce(() => {
    setIsAgentTalking(false);
  }, 800);

  const startMic = async () => {
    wakeLockRequest();
    setIsSettingUp(true);

    const { data: settings } = await supabase
      .from("settings")
      .select("agent_id, assistant_name")
      .eq("id", user?.id)
      .single();

    const registerCallResponse = await registerCall(
      settings?.agent_id || process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      callerId
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
    wakeLockRelease();

    retell.stopConversation();
  };

  return (
    <>
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
      <div>
        <ImageGenerator transcript={storyTranscript}/>
      </div>
    </>
  );
}

export default Wai;
