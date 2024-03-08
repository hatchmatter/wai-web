"use client";

import { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useWakeLock } from "react-screen-wake-lock";

import { registerCall } from "@/libs/wai";

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
}

const retell = new RetellWebClient();

function Wai() {
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [settingUp, setSettingUp] = useState<boolean>(false);

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
      setSettingUp(false);
      // console.log("conversationStarted");
    });

    retell.on("audio", (audio: Uint8Array) => {
      console.log("There is audio", audio);
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
    setSettingUp(true);

    const registerCallResponse = await registerCall();

    if (registerCallResponse.callId) {
      try {
        await retell
          .startConversation({
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
    <div className="flex flex-1 items-center justify-center">
      {!isCalling ? (
        <button
          className="btn btn-circle btn-lg btn-primary"
          onClick={startMic}
          disabled={settingUp}
        >
          Start
        </button>
      ) : (
        <button
          className="btn btn-circle btn-lg btn-secondary"
          onClick={stopMic}
        >
          Stop
        </button>
      )}
    </div>
  );
}

export default Wai;
