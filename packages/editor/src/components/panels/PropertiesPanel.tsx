import type { FlowDiagram } from '@flowdiagram/core';

interface PropertiesPanelProps {
  diagram: FlowDiagram | null;
  onDiagramChange: (diagram: FlowDiagram) => void;
}

export function PropertiesPanel({
  diagram,
  onDiagramChange,
}: PropertiesPanelProps) {
  if (!diagram) return null;

  const animation = diagram.animation;

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <strong>Diagram Properties</strong>
      </div>

      <div className="step-editor">
        <div className="step-editor__row">
          <label>Name:</label>
          <input
            type="text"
            value={diagram.meta.name}
            onChange={(e) =>
              onDiagramChange({
                ...diagram,
                meta: { ...diagram.meta, name: e.target.value },
              })
            }
          />
        </div>
        <div className="step-editor__row">
          <label>Width:</label>
          <input
            type="number"
            value={diagram.canvas.width}
            min={100}
            step={100}
            onChange={(e) =>
              onDiagramChange({
                ...diagram,
                canvas: { ...diagram.canvas, width: Number(e.target.value) },
              })
            }
          />
        </div>
        <div className="step-editor__row">
          <label>Height:</label>
          <input
            type="number"
            value={diagram.canvas.height}
            min={100}
            step={100}
            onChange={(e) =>
              onDiagramChange({
                ...diagram,
                canvas: { ...diagram.canvas, height: Number(e.target.value) },
              })
            }
          />
        </div>
      </div>

      {animation && (
        <div className="step-editor" style={{ marginTop: 8 }}>
          <div className="panel-header">
            <strong>Animation Settings</strong>
          </div>
          <div className="step-editor__row">
            <label>Duration:</label>
            <input
              type="number"
              value={animation.duration}
              min={500}
              step={500}
              onChange={(e) =>
                onDiagramChange({
                  ...diagram,
                  animation: {
                    ...animation,
                    duration: Number(e.target.value),
                  },
                })
              }
            />
            <span>ms</span>
          </div>
          <div className="step-editor__row">
            <label>FPS:</label>
            <input
              type="number"
              value={animation.fps}
              min={1}
              max={60}
              onChange={(e) =>
                onDiagramChange({
                  ...diagram,
                  animation: {
                    ...animation,
                    fps: Number(e.target.value),
                  },
                })
              }
            />
          </div>
          <div className="step-editor__row">
            <label>Loop:</label>
            <input
              type="checkbox"
              checked={animation.loop}
              onChange={(e) =>
                onDiagramChange({
                  ...diagram,
                  animation: {
                    ...animation,
                    loop: e.target.checked,
                  },
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
