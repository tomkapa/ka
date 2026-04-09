import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  AnimationTimeline,
  type AnimationFrameState,
  type FlowDiagram,
} from '@flowdiagram/core';

export interface UseAnimationReturn {
  isPlaying: boolean;
  currentTime: number;
  frameState: AnimationFrameState;
  duration: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seekTo: (timeMs: number) => void;
}

const EMPTY_STATE: AnimationFrameState = { particles: [], nodeEffects: [] };

export function useAnimation(diagram: FlowDiagram | null): UseAnimationReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimestampRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  const timeline = useMemo(() => {
    if (!diagram?.animation) return null;
    return new AnimationTimeline(diagram.animation);
  }, [diagram]);

  const duration = timeline?.duration ?? 0;
  const isLoop = diagram?.animation?.loop ?? true;

  const frameState = useMemo(() => {
    if (!timeline) return EMPTY_STATE;
    return timeline.getStateAtTime(currentTime);
  }, [timeline, currentTime]);

  const animate = useCallback(
    (timestamp: number) => {
      if (!timeline) return;

      if (startTimestampRef.current === 0) {
        startTimestampRef.current = timestamp - pausedAtRef.current;
      }

      const elapsed = timestamp - startTimestampRef.current;

      if (!isLoop && elapsed >= timeline.duration) {
        setCurrentTime(timeline.duration);
        setIsPlaying(false);
        return;
      }

      setCurrentTime(elapsed);
      rafRef.current = requestAnimationFrame(animate);
    },
    [timeline, isLoop],
  );

  const play = useCallback(() => {
    if (!timeline) return;
    setIsPlaying(true);
    startTimestampRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
  }, [timeline, animate]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
    pausedAtRef.current = currentTime;
    startTimestampRef.current = 0;
  }, [currentTime]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
    setCurrentTime(0);
    pausedAtRef.current = 0;
    startTimestampRef.current = 0;
  }, []);

  const seekTo = useCallback((timeMs: number) => {
    const clamped = Math.max(0, timeMs);
    setCurrentTime(clamped);
    pausedAtRef.current = clamped;
    startTimestampRef.current = 0;
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    reset();
  }, [diagram, reset]);

  return {
    isPlaying,
    currentTime,
    frameState,
    duration,
    play,
    pause,
    reset,
    seekTo,
  };
}
