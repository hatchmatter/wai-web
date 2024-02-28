"use client";

import React from "react";
import {
  AudioWsClient,
  convertFloat32ToUint8,
  convertUint8ToFloat32,
} from "retell-sdk";

const agentId: string = "ddbe39893ffc8684a4c2d95b0265320c";

interface RegisterCallResponse {
  callId?: string;
  sampleRate?: number;
}

function Wai() {
  let liveClient: AudioWsClient;
  let audioContext: AudioContext;
  let isCalling: boolean = false;
  let stream: MediaStream;
  let captureNode: ScriptProcessorNode;

  // For playback
  let audioData: Float32Array[] = [];
  let audioDataIndex: number = 0;

  // Setup playback
  const setupAudio = async (sampleRate: number) => {
    audioContext = new AudioContext({
      sampleRate: sampleRate,
    });

    // Get mic stream
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: sampleRate,
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
      },
    });

    const source = audioContext.createMediaStreamSource(stream);

    captureNode = source.context.createScriptProcessor(1024, 1, 1);

    captureNode.onaudioprocess = function (audioProcessingEvent: any) {
      if (isCalling) {
        const pcmFloat32Data =
          audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmData = convertFloat32ToUint8(pcmFloat32Data);
        liveClient.send(pcmData);

        // Playback here
        const outputBuffer = audioProcessingEvent.outputBuffer;
        const outputChannel = outputBuffer.getChannelData(0);

        for (let i = 0; i < outputChannel.length; ++i) {
          if (audioData.length > 0) {
            outputChannel[i] = audioData[0][audioDataIndex++];
            if (audioDataIndex === audioData[0].length) {
              audioData.shift();
              audioDataIndex = 0;
            }
          } else {
            outputChannel[i] = 0;
          }
        }
      }
    };

    source.connect(captureNode);
    captureNode.connect(audioContext.destination);
  };

  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    try {
      // Replace with your server url
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
        throw new Error(`Error: ${response.status}`);
      }

      const data: RegisterCallResponse = await response.json();
      return data;
    } catch (err) {
      throw new Error("error");
    }
  }

  const startMic = async () => {
    try {
      // Call your server to get call id from post-register-call
      const registerCallResponse = await registerCall(agentId);

      if (!registerCallResponse.callId || !registerCallResponse.sampleRate) {
        console.error("Error: Call id or sample rate not found in response.");
        return;
      }

      await setupAudio(registerCallResponse.sampleRate);

      //Start websocket with Retell Server
      liveClient = new AudioWsClient(registerCallResponse.callId);

      // Handling incoming audio data for playback
      liveClient.on("audio", (audio: Uint8Array) => {
        // const blob = new Blob([audio], { type: "audio/wav" });
        const float32Data: Float32Array = convertUint8ToFloat32(audio);
        audioData.push(float32Data);
      });

      // Clear the buffer when server instructs
      liveClient.on("clear", () => {
        audioData = [];
        audioDataIndex = 0;
      });

      // Handle errors and close
      liveClient.on("error", (error: string) => {
        console.error("Call error: ", error);
        stopMic();
      });

      liveClient.on("close", (code: number, reason: string) => {
        console.log("Call closed: ", code, reason);
        stopMic();
      });

      isCalling = true;
      audioContext.resume();
    } catch (err) {
      console.error("Error in creating web call: ", err);
    }
  };

  const stopMic = () => {
    isCalling = false;
    liveClient?.close();
    audioContext?.suspend();
    captureNode?.disconnect();
    stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <header className="flex gap-2">
        <button className="btn" onClick={startMic}>
          Start
        </button>
        <button className="btn" onClick={stopMic}>
          Stop
        </button>
      </header>
    </div>
  );
}

export default Wai;
