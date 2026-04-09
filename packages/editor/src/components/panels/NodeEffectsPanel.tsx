import { useCallback } from 'react';
import type { FlowDiagram, NodeEffect, NodeEffectType } from '@flowdiagram/core';
import { ensureAnimation } from '../../utils/diagram.js';

interface NodeEffectsPanelProps {
  diagram: FlowDiagram | null;
  onDiagramChange: (diagram: FlowDiagram) => void;
}

const EFFECT_TYPES: NodeEffectType[] = ['pulse', 'glow', 'highlight'];

export function NodeEffectsPanel({
  diagram,
  onDiagramChange,
}: NodeEffectsPanelProps) {
  const effects = diagram?.animation?.nodeEffects ?? [];
  const nodes = diagram?.nodes ?? [];

  const handleAdd = useCallback(() => {
    if (!diagram || nodes.length === 0) return;
    const d = ensureAnimation(diagram);
    const newEffect: NodeEffect = {
      nodeId: nodes[0].id,
      effect: 'pulse',
      triggerTime: 0,
      duration: 500,
      color: '#4CAF50',
    };
    onDiagramChange({
      ...d,
      animation: {
        ...d.animation!,
        nodeEffects: [...d.animation!.nodeEffects, newEffect],
      },
    });
  }, [diagram, nodes, ensureAnimation, onDiagramChange]);

  const handleUpdate = useCallback(
    (index: number, updates: Partial<NodeEffect>) => {
      if (!diagram?.animation) return;
      onDiagramChange({
        ...diagram,
        animation: {
          ...diagram.animation,
          nodeEffects: diagram.animation.nodeEffects.map((e, i) =>
            i === index ? { ...e, ...updates } : e,
          ),
        },
      });
    },
    [diagram, onDiagramChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (!diagram?.animation) return;
      onDiagramChange({
        ...diagram,
        animation: {
          ...diagram.animation,
          nodeEffects: diagram.animation.nodeEffects.filter(
            (_, i) => i !== index,
          ),
        },
      });
    },
    [diagram, onDiagramChange],
  );

  return (
    <div className="node-effects-panel">
      <div className="panel-header">
        <strong>Node Effects</strong>
        <button onClick={handleAdd} className="panel-btn-sm">
          + Add
        </button>
      </div>

      {effects.map((effect, i) => (
        <div key={i} className="step-editor">
          <div className="step-editor__row">
            <label>Node:</label>
            <select
              value={effect.nodeId}
              onChange={(e) => handleUpdate(i, { nodeId: e.target.value })}
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label}
                </option>
              ))}
            </select>
          </div>
          <div className="step-editor__row">
            <label>Effect:</label>
            <select
              value={effect.effect}
              onChange={(e) =>
                handleUpdate(i, { effect: e.target.value as NodeEffectType })
              }
            >
              {EFFECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="step-editor__row">
            <label>Color:</label>
            <input
              type="color"
              value={effect.color}
              onChange={(e) => handleUpdate(i, { color: e.target.value })}
            />
          </div>
          <div className="step-editor__row">
            <label>Trigger:</label>
            <input
              type="number"
              value={effect.triggerTime}
              step={100}
              min={0}
              onChange={(e) =>
                handleUpdate(i, { triggerTime: Number(e.target.value) })
              }
            />
            <span>ms</span>
          </div>
          <div className="step-editor__row">
            <label>Duration:</label>
            <input
              type="number"
              value={effect.duration}
              step={100}
              min={100}
              onChange={(e) =>
                handleUpdate(i, { duration: Number(e.target.value) })
              }
            />
            <span>ms</span>
          </div>
          <button className="panel-btn-xs" onClick={() => handleRemove(i)}>
            Remove
          </button>
        </div>
      ))}

      {effects.length === 0 && (
        <div className="panel-empty">No node effects yet</div>
      )}
    </div>
  );
}
