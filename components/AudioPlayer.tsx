"use client";

import React, { useRef, useEffect } from "react";

type AudioPlayerProps = {
  id: string;
  audioPath: string;
  isPlaying: boolean;
  onChangePlayback: (id: String) => void;
};

const AudioPlayer = ({ id, audioPath, isPlaying, onChangePlayback }: AudioPlayerProps) => {
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

  // handles whether the audio should be playing or not
  useEffect(() => {
    const handleAudioControl = () => {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };

    handleAudioControl();
  }, [isPlaying]);

  return (
    <>
      <div>
        <button
          type="button"
          className="icon-button"
          onClick={() => onChangePlayback(id)}
        >
          {isPlaying ? pauseButton : playButton}
        </button>
        <audio
          ref={audioRef}
          src={audioPath}
          onEnded={() => onChangePlayback(id)}
        />
      </div>
    </>
  );
};

export default AudioPlayer;
