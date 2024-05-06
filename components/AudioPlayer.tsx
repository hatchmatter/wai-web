"use client";

import React, { useRef, useEffect } from "react";

import { AudioInfo } from "@/components/SettingsWai";

type AudioPlayerProps = {
  agentId: string;
  audioPath: string;
  playbackState: AudioInfo;
  onChangePlaybackState: (info: AudioInfo) => void;
};

const AudioPlayer = ({ agentId, audioPath, playbackState, onChangePlaybackState }: AudioPlayerProps) => {
  const audioRef = useRef(null);
  
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

  // set up audio source on mount, and clean up audio on dismount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioPath;
      audioRef.current.load();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, [audioPath]);

  // resets audio if another is playing (audio was switched)
  useEffect(() => {
    if (playbackState.isPlaying && agentId !== playbackState.id) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [playbackState]);

  const stopAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    onChangePlaybackState({ isPlaying: false, id: ""});
  };

  const handlePlayback = (agentId: string) => {
    if (playbackState.isPlaying && playbackState.id === agentId) {
      stopAudio();
    } else {
      onChangePlaybackState({ isPlaying: true, id: agentId });
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
  };

  return (
    <>
      <div>
        <button
          type="button"
          className="icon-button"
          onClick={() => handlePlayback(agentId)}
        >
          {playbackState.isPlaying && playbackState.id === agentId
            ? pauseButton
            : playButton}
        </button>
        <audio
          ref={audioRef}
          src={audioPath}
          onEnded={stopAudio}
        />
      </div>
    </>
  );
};

export default AudioPlayer;
