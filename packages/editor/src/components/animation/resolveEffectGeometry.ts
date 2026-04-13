import { useMemo } from 'react';
import type { Node as RFNode } from '@xyflow/react';
import type { NodeEffectState } from '@flowdiagram/core';

export interface EffectGeometry {
  effect: NodeEffectState;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useEffectGeometry(
  effects: NodeEffectState[],
  rfNodes: RFNode[],
): EffectGeometry[] {
  return useMemo(() => {
    const nodeMap = new Map(rfNodes.map((n) => [n.id, n]));

    return effects.reduce<EffectGeometry[]>((acc, effect) => {
      const node = nodeMap.get(effect.nodeId);
      if (node) {
        acc.push({
          effect,
          x: node.position.x,
          y: node.position.y,
          width: node.width ?? 120,
          height: node.height ?? 60,
        });
      }
      return acc;
    }, []);
  }, [effects, rfNodes]);
}
