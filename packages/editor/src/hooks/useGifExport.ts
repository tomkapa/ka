import { useState, useCallback, type RefObject } from 'react';
import GIF from 'gif.js';
import html2canvas from 'html2canvas';
import type { FlowDiagram } from '@flowdiagram/core';
import { downloadBlob } from '../utils/downloadBlob.js';
import type { GifExportConfig } from '../types/gifExportConfig.js';

const WORKER_SCRIPT = '/gif.worker.js';

function waitForPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

export interface UseGifExportReturn {
  isExporting: boolean;
  exportProgress: number;
  exportGif: (config: GifExportConfig) => Promise<void>;
}

export function useGifExport(
  diagram: FlowDiagram | null,
  canvasRef: RefObject<HTMLDivElement | null>,
  seekTo: (timeMs: number) => void,
  fitForExport: (width: number, height: number) => void,
): UseGifExportReturn {
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const exportGif = useCallback(
    async (config: GifExportConfig) => {
      const canvas = canvasRef.current;
      if (!diagram?.animation || !canvas) {
        throw new Error('No animation or canvas to export');
      }
      if (config.duration === 0) {
        throw new Error('Animation duration is zero — nothing to export');
      }

      const frameInterval = 1000 / config.fps;
      const totalFrames = Math.ceil(config.duration / frameInterval);

      setExportProgress(0);

      // Center nodes in the export frame
      fitForExport(config.width, config.height);
      await waitForPaint();

      const gif = new GIF({
        workers: 2,
        quality: config.quality,
        width: config.width,
        height: config.height,
        workerScript: WORKER_SCRIPT,
        repeat: 0,
      });

      const h2cOptions = {
        width: config.width,
        height: config.height,
        scale: 1 as const,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      };
      const frameOptions = { delay: frameInterval, copy: true };

      try {
        for (let i = 0; i < totalFrames; i++) {
          const timeMs = i * frameInterval;
          seekTo(timeMs);
          await waitForPaint();

          const frameCanvas = await html2canvas(canvas, h2cOptions);
          gif.addFrame(frameCanvas, frameOptions);
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
    },
    [diagram, seekTo, fitForExport],
  );

  return {
    isExporting: exportProgress !== null,
    exportProgress: exportProgress ?? 0,
    exportGif,
  };
}
