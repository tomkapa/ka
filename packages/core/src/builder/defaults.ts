import type { Canvas, Size, EdgeStyle } from '../types/index.js';

export const DEFAULT_CANVAS: Canvas = {
  width: 1200,
  height: 800,
  background: '#ffffff',
};

export const DEFAULT_NODE_SIZE: Size = {
  width: 120,
  height: 60,
};

export const DEFAULT_ENTITY_NODE_SIZE: Size = {
  width: 80,
  height: 80,
};

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  stroke: '#666666',
  strokeWidth: 2,
  type: 'smoothstep',
  animated: false,
  arrowHead: 'arrow',
};
