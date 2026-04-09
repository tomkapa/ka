import type { FlowDiagram } from '@flowdiagram/core';

export function ensureAnimation(d: FlowDiagram): FlowDiagram {
  if (d.animation) return d;
  return {
    ...d,
    animation: {
      type: 'flow',
      duration: 3000,
      fps: 12,
      loop: true,
      sequences: [],
      nodeEffects: [],
    },
  };
}
