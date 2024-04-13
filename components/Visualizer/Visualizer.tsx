// borrowed from https://github.com/samhirtarif/react-audio-visualize/blob/master/src/LiveAudioVisualizer/LiveAudioVisualizer.tsx

"use client";

import { useRef, useEffect, useCallback } from "react";
import { processAndDraw } from "./utils";

interface VisualizerProps {
  data: Uint8Array;
  isActive: boolean;
}

interface CustomCanvasRenderingContext2D extends CanvasRenderingContext2D {
  roundRect: (
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) => void;
}

export default function Visualizer({ data, isActive }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const tick = (timeStamp?: number) => {
      if (isActive && canvasRef.current && data) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d") as CustomCanvasRenderingContext2D;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(data, ctx);
        requestAnimationFrame(tick);
      }
    };

    tick();
  }, [isActive, data, canvasRef.current]);

  return (
    <canvas
      ref={canvasRef}
      id="visualizer"
      width="300"
      height="300"
      style={{ aspectRatio: "unset" }}
    ></canvas>
  );
}

function draw(data: Uint8Array, ctx: CustomCanvasRenderingContext2D) {
  const average = data.reduce((acc, val) => acc + val, 0) / data.length;
  ctx.beginPath();
  ctx.arc(150, 150, average / 2, 0, 2 * Math.PI);
  ctx.lineWidth = 3
  ctx.strokeStyle = "black";
  ctx.stroke();
}
