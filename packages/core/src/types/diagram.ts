import type { DiagramMeta, Canvas } from './canvas.js';
import type { EntityConfig } from './entity.js';
import type { DiagramNode } from './node.js';
import type { DiagramEdge } from './edge.js';
import type { AnimationConfig } from './animation.js';

export interface FlowDiagram {
  version: string;
  meta: DiagramMeta;
  canvas: Canvas;
  entities: EntityConfig;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  animation?: AnimationConfig;
}
