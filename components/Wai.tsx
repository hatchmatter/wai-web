"use client";

import { useRef, useState } from "react";
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
  const wsClient = useRef<AudioWsClient>();
  const audioContext = useRef<AudioContext>();
  const stream = useRef<MediaStream>();
  const captureNode = useRef<ScriptProcessorNode>();
  const audioData = useRef<Float32Array[]>([]);
  const audioDataIndex = useRef<number>(0);
  const [isCalling, setIsCalling] = useState<boolean>(false);

  // Setup playback
  const setupAudio = async (sampleRate: number) => {
    audioContext.current = new AudioContext({
      sampleRate: sampleRate,
    });

    // Get mic stream
    stream.current = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: sampleRate,
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
      },
    });

    const source = audioContext.current.createMediaStreamSource(stream.current);

    captureNode.current = source.context.createScriptProcessor(1024, 1, 1);

    captureNode.current.onaudioprocess = function (
      audioProcessingEvent: AudioProcessingEvent
    ) {
       // Send audio data (mic input) to server
      const inputBuffer = audioProcessingEvent.inputBuffer;
      const inputChannel = inputBuffer.getChannelData(0); // pcmFloat32Data
      const pcmData = convertFloat32ToUint8(inputChannel);

      wsClient.current.send(pcmData);

      // Playback here
      const outputBuffer = audioProcessingEvent.outputBuffer;
      const outputChannel = outputBuffer.getChannelData(0);

      for (let i = 0; i < outputChannel.length; ++i) {
        if (audioData.current.length > 0) {
          outputChannel[i] = audioData.current[0][audioDataIndex.current++];
          if (audioDataIndex.current === audioData.current[0].length) {
            audioData.current.shift();
            audioDataIndex.current = 0;
          }
        } else {
          outputChannel[i] = 0;
        }
      }
    };

    source.connect(captureNode.current);
    captureNode.current.connect(audioContext.current.destination);
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
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data: RegisterCallResponse = await response.json();
      return data;
    } catch (err) {
      console.error("Error: ", err);
      return {};
    }
  }

  const startMic = async () => {
    try {
      // Call your server to get call id from post-register-call
      const registerCallResponse = await registerCall(agentId);

      console.log("registerCallResponse: ", registerCallResponse);

      if (!registerCallResponse.callId || !registerCallResponse.sampleRate) {
        console.error("Error: Call id or sample rate not found in response.");
        return;
      }

      await setupAudio(registerCallResponse.sampleRate);

      //Start websocket with Retell Server
      wsClient.current = new AudioWsClient(registerCallResponse.callId);

      // Handling incoming audio data for playback
      wsClient.current.on("audio", (audio: Uint8Array) => {
        // const blob = new Blob([audio], { type: "audio/wav" });
        const float32Data: Float32Array = convertUint8ToFloat32(audio);
        audioData.current.push(float32Data);
      });

      // Clear the buffer when server instructs
      wsClient.current.on("clear", () => {
        audioData.current = [];
        audioDataIndex.current = 0;
      });

      // Handle errors and close
      wsClient.current.on("error", (error: string) => {
        console.error("Call error: ", error);
        stopMic();
      });

      wsClient.current.on("close", (code: number, reason: string) => {
        console.log("Call closed: ", code, reason);
        stopMic();
      });

      setIsCalling(true);
      audioContext.current.resume();
    } catch (err) {
      console.error("Error in creating web call: ", err);
    }
  };

  const stopMic = () => {
    if (!isCalling) return;

    setIsCalling(false);
    wsClient.current.close();
    audioContext.current.suspend();
    captureNode.current.disconnect();
    stream.current
      .getTracks()
      .forEach((track: MediaStreamTrack) => track.stop());
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <header className="flex gap-2">
        {!isCalling ? (
          <button className="btn btn-circle btn-lg" onClick={startMic}>
            Start
          </button>
        ) : (
          <button className="btn btn-circle btn-lg" onClick={stopMic}>
            Stop
          </button>
        )}
      </header>
    </div>
  );
}

export default Wai;
