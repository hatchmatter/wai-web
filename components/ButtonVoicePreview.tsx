"use client";

import React, { RefObject } from "react";

import { AudioInfo } from "@/components/SettingsWai";

type ButtonPreviewProps = {
  agentId: string;
  agentName: string;
  audioInfo: AudioInfo;
  setAudioInfo: (info: AudioInfo) => void;
  cleanAudio: () => void;
  audioRef: RefObject<HTMLAudioElement>;
};

const ButtonVoicePreview = ({ agentId, agentName, audioInfo, setAudioInfo, cleanAudio, audioRef }: ButtonPreviewProps) => {
  const playButton = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z" />
    </svg>
  );

  const pauseButton = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-1ZM10.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-1Z" />
    </svg>
  );

  const stopAudio = () => {
    cleanAudio();
    setAudioInfo({ isPlaying: false, agentId: "", src: "" });
  };

  const playAudio = (id: string, name: string) => {
    if (audioInfo.isPlaying && audioInfo.agentId === id) {
      stopAudio();
    } else {
      setAudioInfo({ isPlaying: true, agentId: id, src: `/audio/${name}.wav` });
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

  return (
    <>
      <div>
        <button
          type="button"
          className="icon-button"
          onClick={() => playAudio(agentId, agentName)}
        >
          {audioInfo.isPlaying && audioInfo.agentId === agentId
            ? pauseButton
            : playButton}
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
    </>
  );
};

export default ButtonVoicePreview;
