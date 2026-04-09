import { useCallback } from 'react';

interface AnimationControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (timeMs: number) => void;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const millis = Math.floor((ms % 1000) / 100);
  return `${seconds}.${millis}s`;
}

export function AnimationControls({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onReset,
  onSeek,
}: AnimationControlsProps) {
  const handleScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSeek(Number(e.target.value));
    },
    [onSeek],
  );

  if (duration === 0) {
    return (
      <span style={{ fontSize: 12, color: '#999' }}>No animation</span>
    );
  }

  const displayTime = duration > 0 ? currentTime % duration : 0;

  return (
    <div className="animation-controls">
      <button
        onClick={isPlaying ? onPause : onPlay}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '||' : '\u25B6'}
      </button>
      <button onClick={onReset} title="Reset">
        \u25A0
      </button>
      <input
        type="range"
        min={0}
        max={duration}
        value={displayTime}
        onChange={handleScrub}
        className="animation-controls__scrubber"
      />
      <span className="animation-controls__time">
        {formatTime(displayTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
