// borrowed from https://github.com/samhirtarif/react-audio-visualize/blob/master/src/LiveAudioVisualizer/LiveAudioVisualizer.tsx

"use client";

import { useRef, useEffect, useCallback } from "react";
import { processAndDraw } from "./utils";

interface VisualizerProps {
  data: Uint8Array;
  isActive: boolean;
}

export default function Visualizer({ data, isActive }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isActive && canvasRef.current && data) {
      // processAndDraw(data, canvasRef.current);
    }
  }, [isActive, data, canvasRef.current]);

  return null;

  return (
    <canvas
      ref={canvasRef}
      id="visualizer"
      width="300"
      height="200"
      style={{ aspectRatio: "unset" }}
    ></canvas>
  );
}
