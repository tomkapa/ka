import { useState, useCallback, type RefObject } from 'react';
import GIF from 'gif.js';
import html2canvas from 'html2canvas';
import type { FlowDiagram } from '@flowdiagram/core';
import { downloadBlob } from '../utils/downloadBlob.js';

const EXPORT_FPS = 12;
const EXPORT_WIDTH = 800;
const EXPORT_HEIGHT = 600;
const WORKER_SCRIPT = '/gif.worker.js';

/** Wait for two paint frames so React has committed and the browser has painted. */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

export interface UseGifExportReturn {
  isExporting: boolean;
  exportProgress: number;
  exportGif: () => Promise<void>;
}

export function useGifExport(
  diagram: FlowDiagram | null,
  canvasRef: RefObject<HTMLDivElement | null>,
  seekTo: (timeMs: number) => void,
  duration: number,
): UseGifExportReturn {
  // null = idle; 0..1 = export in progress
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const exportGif = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!diagram?.animation || !canvas) {
      throw new Error('No animation or canvas to export');
    }
    if (duration === 0) {
      throw new Error('Animation duration is zero — nothing to export');
    }

    const frameInterval = 1000 / EXPORT_FPS;
    const totalFrames = Math.ceil(duration / frameInterval);

    setExportProgress(0);

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
      workerScript: WORKER_SCRIPT,
      repeat: 0,
    });

    try {
      for (let i = 0; i < totalFrames; i++) {
        const timeMs = i * frameInterval;
        seekTo(timeMs);
        await waitForPaint();

        const frameCanvas = await html2canvas(canvas, {
          width: EXPORT_WIDTH,
          height: EXPORT_HEIGHT,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        gif.addFrame(frameCanvas, { delay: frameInterval, copy: true });
        // Frame capture counts for the first half of progress; encoding for the second
        setExportProgress((i + 1) / totalFrames / 2);
      }

      await new Promise<void>((resolve, reject) => {
        gif.on('progress', (p) => setExportProgress(0.5 + p * 0.5));
        gif.on('finished', (blob) => {
          downloadBlob(blob, `${diagram.meta.name || 'diagram'}.gif`);
          resolve();
        });
        gif.on('error', (err) => reject(err));
        gif.render();
      });
    } finally {
      setExportProgress(null);
      seekTo(0);
    }
  }, [diagram, seekTo, duration]);

  return {
    isExporting: exportProgress !== null,
    exportProgress: exportProgress ?? 0,
    exportGif,
  };
}
