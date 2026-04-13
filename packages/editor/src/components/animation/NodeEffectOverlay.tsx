import { useViewport, type Node as RFNode } from '@xyflow/react';
import type { NodeEffectState, NodeEffectType } from '@flowdiagram/core';
import { useEffectGeometry } from './resolveEffectGeometry.js';

interface NodeEffectOverlayProps {
  effects: NodeEffectState[];
  rfNodes: RFNode[];
}

export function NodeEffectOverlay({ effects, rfNodes }: NodeEffectOverlayProps) {
  const { x: vpX, y: vpY, zoom } = useViewport();
  const effectRenders = useEffectGeometry(effects, rfNodes);

  if (effectRenders.length === 0) return null;

  return (
    <div
      className="node-effect-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div
        style={{
          transformOrigin: '0 0',
          transform: `translate(${vpX}px, ${vpY}px) scale(${zoom})`,
        }}
      >
        {effectRenders.map(({ effect, x, y, width, height }) => {
          const style = getEffectStyle(effect);
          return (
            <div
              key={effect.nodeId}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width,
                height,
                ...style,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function getEffectStyle(effect: NodeEffectState): React.CSSProperties {
  const alpha = effect.intensity;

  switch (effect.effect satisfies NodeEffectType) {
    case 'pulse':
      return {
        borderRadius: 8,
        boxShadow: `0 0 ${12 * alpha}px ${4 * alpha}px ${effect.color}`,
        transform: `scale(${1 + 0.05 * alpha})`,
        transition: 'box-shadow 0.1s, transform 0.1s',
      };
    case 'glow':
      return {
        borderRadius: 8,
        boxShadow: `0 0 ${20 * alpha}px ${8 * alpha}px ${effect.color}`,
      };
    case 'highlight':
      return {
        borderRadius: 8,
        backgroundColor: effect.color,
        opacity: alpha * 0.3,
      };
  }
}
