import { useState } from 'react';
import type { GifExportConfig } from '../types/gifExportConfig.js';

interface GifExportDialogProps {
  initialConfig: GifExportConfig;
  onExport: (config: GifExportConfig) => void;
  onCancel: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `~${(bytes / 1024).toFixed(1)} KB`;
  }
  return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function GifExportDialog({ initialConfig, onExport, onCancel }: GifExportDialogProps) {
  const [config, setConfig] = useState<GifExportConfig>(initialConfig);

  function set<K extends keyof GifExportConfig>(key: K, value: GifExportConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  const frames = Math.ceil((config.duration / 1000) * config.fps);
  const sizeBytes = config.width * config.height * frames * 0.5;

  return (
    <div className="gif-dialog-overlay">
      <div className="gif-dialog" role="dialog" aria-label="GIF export settings">
        <div className="gif-dialog__header">Export GIF</div>

        <div className="gif-dialog__body">
          <div className="gif-dialog__row">
            <label className="gif-dialog__label">Width</label>
            <input
              className="gif-dialog__input gif-dialog__input--number"
              type="number"
              min={100}
              max={3840}
              value={config.width}
              onChange={(e) => set('width', Math.max(100, parseInt(e.target.value, 10) || 100))}
            />
            <span className="gif-dialog__unit">px</span>
          </div>

          <div className="gif-dialog__row">
            <label className="gif-dialog__label">Height</label>
            <input
              className="gif-dialog__input gif-dialog__input--number"
              type="number"
              min={100}
              max={2160}
              value={config.height}
              onChange={(e) => set('height', Math.max(100, parseInt(e.target.value, 10) || 100))}
            />
            <span className="gif-dialog__unit">px</span>
          </div>

          <div className="gif-dialog__row">
            <label className="gif-dialog__label">FPS</label>
            <input
              className="gif-dialog__input gif-dialog__input--range"
              type="range"
              min={1}
              max={30}
              value={config.fps}
              onChange={(e) => set('fps', parseInt(e.target.value, 10))}
            />
            <span className="gif-dialog__unit gif-dialog__unit--fixed">{config.fps} fps</span>
          </div>

          <div className="gif-dialog__row">
            <label className="gif-dialog__label">Duration</label>
            <input
              className="gif-dialog__input gif-dialog__input--number"
              type="number"
              min={100}
              max={60000}
              step={100}
              value={config.duration}
              onChange={(e) => set('duration', Math.max(100, parseInt(e.target.value, 10) || 100))}
            />
            <span className="gif-dialog__unit">ms</span>
          </div>

          <div className="gif-dialog__row">
            <label className="gif-dialog__label">Quality</label>
            <input
              className="gif-dialog__input gif-dialog__input--range"
              type="range"
              min={1}
              max={30}
              value={config.quality}
              onChange={(e) => set('quality', parseInt(e.target.value, 10))}
            />
            <span className="gif-dialog__unit gif-dialog__unit--fixed">
              {config.quality === 1 ? 'Best' : config.quality <= 10 ? 'High' : config.quality <= 20 ? 'Medium' : 'Draft'}
            </span>
          </div>

          <div className="gif-dialog__estimate">
            <span>{frames} frames</span>
            <span className="gif-dialog__estimate-size">{formatBytes(sizeBytes)}</span>
          </div>
        </div>

        <div className="gif-dialog__footer">
          <button className="gif-dialog__btn gif-dialog__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="gif-dialog__btn gif-dialog__btn--export"
            onClick={() => onExport(config)}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
