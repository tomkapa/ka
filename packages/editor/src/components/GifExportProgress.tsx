interface GifExportProgressProps {
  progress: number;
}

export function GifExportProgress({ progress }: GifExportProgressProps) {
  const percent = Math.round(progress * 100);

  return (
    <div className="gif-export-progress">
      <div className="gif-export-progress__backdrop" />
      <div className="gif-export-progress__dialog">
        <div className="gif-export-progress__title">Exporting GIF…</div>
        <div className="gif-export-progress__bar-track">
          <div
            className="gif-export-progress__bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="gif-export-progress__label">{percent}%</div>
      </div>
    </div>
  );
}
