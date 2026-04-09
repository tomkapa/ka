export type EdgeType = 'smoothstep' | 'bezier' | 'straight';
export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';
export type ArrowHead = 'arrow' | 'arrowclosed' | 'none';

export interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  type?: EdgeType;
  animated?: boolean;
  arrowHead?: ArrowHead;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  label?: string;
  style: EdgeStyle;
}
