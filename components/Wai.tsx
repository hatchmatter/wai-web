"use client";

import { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { useWakeLock } from "react-screen-wake-lock";

const agentId: string = "ddbe39893ffc8684a4c2d95b0265320c";

interface RegisterCallResponse {
  callId?: string;
  sampleRate?: number;
}

const webClient = new RetellWebClient();

function Wai() {
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [settingUp, setSettingUp] = useState<boolean>(false);

  const { isSupported, released, request, release } = useWakeLock({
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
    webClient.on("conversationStarted", () => {
      setSettingUp(false);
      setIsCalling(true);
      // console.log("conversationStarted");
    });

    webClient.on("audio", (audio: Uint8Array) => {
      // console.log("There is audio");
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      // console.log("Closed with code:", code, ", reason:", reason);
      setIsCalling(false);
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      // prints transcript
      // console.log("update", update);
    });
  }, []);

  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WSS_URL}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: agentId,
        }),
      }
    );

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return {};
    }

    return await response.json();
  }

  const startMic = async () => {
    setSettingUp(true);

    try {
      if (isSupported && !released) {
        request();
      }
    } catch (err) {
      console.error("Error in requesting wake lock: ", err);
    }

    const registerCallResponse = await registerCall(agentId);

    if (registerCallResponse.callId) {
      webClient
        .startConversation({
          callId: registerCallResponse.callId,
          sampleRate: registerCallResponse.sampleRate,
          enableUpdate: true,
        })
        .catch(console.error);
    }
  };

  const stopMic = () => {
    if (isSupported && !released && isCalling) {
      release();
    }

    webClient.stopConversation();
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
