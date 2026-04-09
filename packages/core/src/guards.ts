import type { DiagramNode, EntityNode, ShapeNode, FlowDiagram } from './types/index.js';

export function isEntityNode(node: DiagramNode): node is EntityNode {
  return node.type === 'entity';
}

export function isShapeNode(node: DiagramNode): node is ShapeNode {
  return node.type === 'shape';
}

export function isFlowDiagram(value: unknown): value is FlowDiagram {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.version === 'string' &&
    typeof obj.meta === 'object' &&
    obj.meta !== null &&
    typeof obj.canvas === 'object' &&
    obj.canvas !== null &&
    typeof obj.entities === 'object' &&
    obj.entities !== null &&
    Array.isArray(obj.nodes) &&
    Array.isArray(obj.edges)
  );
}
