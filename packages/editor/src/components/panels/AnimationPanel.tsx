import { useState, useCallback } from 'react';
import { generateId, type FlowDiagram, type AnimationSequence, type AnimationStep } from '@flowdiagram/core';
import { ensureAnimation } from '../../utils/diagram.js';

interface AnimationPanelProps {
  diagram: FlowDiagram | null;
  onDiagramChange: (diagram: FlowDiagram) => void;
}

const DEFAULT_STEP: Omit<AnimationStep, 'edgeId'> = {
  particleColor: '#2196F3',
  particleSize: 6,
  speed: 1.0,
  startTime: 0,
  duration: 1500,
};

export function AnimationPanel({
  diagram,
  onDiagramChange,
}: AnimationPanelProps) {
  const [selectedSeqId, setSelectedSeqId] = useState<string | null>(null);

  const sequences = diagram?.animation?.sequences ?? [];
  const edges = diagram?.edges ?? [];

  const handleAddSequence = useCallback(() => {
    if (!diagram) return;
    const d = ensureAnimation(diagram);
    const id = `seq-${generateId()}`;
    const newSeq: AnimationSequence = {
      id,
      name: `Sequence ${(d.animation!.sequences.length + 1)}`,
      steps: [],
    };
    onDiagramChange({
      ...d,
      animation: {
        ...d.animation!,
        sequences: [...d.animation!.sequences, newSeq],
      },
    });
    setSelectedSeqId(id);
  }, [diagram, ensureAnimation, onDiagramChange]);

  const handleRemoveSequence = useCallback(
    (seqId: string) => {
      if (!diagram?.animation) return;
      onDiagramChange({
        ...diagram,
        animation: {
          ...diagram.animation,
          sequences: diagram.animation.sequences.filter((s) => s.id !== seqId),
        },
      });
      if (selectedSeqId === seqId) setSelectedSeqId(null);
    },
    [diagram, selectedSeqId, onDiagramChange],
  );

  const handleAddStep = useCallback(
    (seqId: string, edgeId: string) => {
      if (!diagram?.animation) return;

      const lastStep = diagram.animation.sequences
        .find((s) => s.id === seqId)
        ?.steps.at(-1);
      const startTime = lastStep
        ? lastStep.startTime + lastStep.duration
        : 0;

      const step: AnimationStep = {
        ...DEFAULT_STEP,
        edgeId,
        startTime,
      };

      onDiagramChange({
        ...diagram,
        animation: {
          ...diagram.animation,
          sequences: diagram.animation.sequences.map((s) =>
            s.id === seqId ? { ...s, steps: [...s.steps, step] } : s,
          ),
        },
      });
    },
    [diagram, onDiagramChange],
  );

  const handleUpdateStep = useCallback(
    (
      seqId: string,
      stepIndex: number,
      updates: Partial<AnimationStep>,
    ) => {
      if (!diagram?.animation) return;
      onDiagramChange({
        ...diagram,
        animation: {
          ...diagram.animation,
          sequences: diagram.animation.sequences.map((s) =>
            s.id === seqId
              ? {
                  ...s,
                  steps: s.steps.map((st, i) =>
                    i === stepIndex ? { ...st, ...updates } : st,
                  ),
                }
              : s,
          ),
        },
      });
    },
    [diagram, onDiagramChange],
  );

  const handleRemoveStep = useCallback(
    (seqId: string, stepIndex: number) => {
      if (!diagram?.animation) return;
      onDiagramChange({
        ...diagram,
        animation: {
          ...diagram.animation,
          sequences: diagram.animation.sequences.map((s) =>
            s.id === seqId
              ? { ...s, steps: s.steps.filter((_, i) => i !== stepIndex) }
              : s,
          ),
        },
      });
    },
    [diagram, onDiagramChange],
  );

  const selectedSeq = sequences.find((s) => s.id === selectedSeqId);

  return (
    <div className="animation-panel">
      <div className="panel-header">
        <strong>Animation Sequences</strong>
        <button onClick={handleAddSequence} className="panel-btn-sm">
          + Add
        </button>
      </div>

      <div className="panel-list">
        {sequences.map((seq) => (
          <div
            key={seq.id}
            className={`panel-list-item ${selectedSeqId === seq.id ? 'panel-list-item--selected' : ''}`}
            onClick={() => setSelectedSeqId(seq.id)}
          >
            <span>{seq.name}</span>
            <span className="panel-list-item__meta">
              {seq.steps.length} step{seq.steps.length !== 1 ? 's' : ''}
            </span>
            <button
              className="panel-btn-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSequence(seq.id);
              }}
            >
              x
            </button>
          </div>
        ))}
        {sequences.length === 0 && (
          <div className="panel-empty">No sequences yet</div>
        )}
      </div>

      {selectedSeq && (
        <div className="panel-detail">
          <div className="panel-header">
            <strong>Steps: {selectedSeq.name}</strong>
          </div>

          {selectedSeq.steps.map((step, i) => (
            <div key={i} className="step-editor">
              <div className="step-editor__row">
                <label>Edge:</label>
                <select
                  value={step.edgeId}
                  onChange={(e) =>
                    handleUpdateStep(selectedSeq.id, i, {
                      edgeId: e.target.value,
                    })
                  }
                >
                  {edges.map((edge) => (
                    <option key={edge.id} value={edge.id}>
                      {edge.label || edge.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="step-editor__row">
                <label>Color:</label>
                <input
                  type="color"
                  value={step.particleColor}
                  onChange={(e) =>
                    handleUpdateStep(selectedSeq.id, i, {
                      particleColor: e.target.value,
                    })
                  }
                />
              </div>
              <div className="step-editor__row">
                <label>Size:</label>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={step.particleSize}
                  onChange={(e) =>
                    handleUpdateStep(selectedSeq.id, i, {
                      particleSize: Number(e.target.value),
                    })
                  }
                />
                <span>{step.particleSize}</span>
              </div>
              <div className="step-editor__row">
                <label>Start:</label>
                <input
                  type="number"
                  value={step.startTime}
                  step={100}
                  min={0}
                  onChange={(e) =>
                    handleUpdateStep(selectedSeq.id, i, {
                      startTime: Number(e.target.value),
                    })
                  }
                />
                <span>ms</span>
              </div>
              <div className="step-editor__row">
                <label>Duration:</label>
                <input
                  type="number"
                  value={step.duration}
                  step={100}
                  min={100}
                  onChange={(e) =>
                    handleUpdateStep(selectedSeq.id, i, {
                      duration: Number(e.target.value),
                    })
                  }
                />
                <span>ms</span>
              </div>
              <button
                className="panel-btn-xs"
                onClick={() => handleRemoveStep(selectedSeq.id, i)}
              >
                Remove step
              </button>
            </div>
          ))}

          {edges.length > 0 && (
            <button
              className="panel-btn-sm"
              onClick={() => handleAddStep(selectedSeq.id, edges[0].id)}
            >
              + Add Step
            </button>
          )}
        </div>
      )}
    </div>
  );
}
