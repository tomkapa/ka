export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type ShapeType =
  | 'rectangle'
  | 'diamond'
  | 'circle'
  | 'ellipse'
  | 'hexagon';

export interface BaseNodeStyle {
  opacity?: number;
}

export interface EntityNodeStyle extends BaseNodeStyle {
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  labelColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface ShapeNodeStyle extends BaseNodeStyle {
  fill?: string;
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
}

interface BaseNode {
  id: string;
  label: string;
  position: Position;
  size: Size;
}

export interface EntityNode extends BaseNode {
  type: 'entity';
  entityId: string;
  style: EntityNodeStyle;
}

export interface ShapeNode extends BaseNode {
  type: 'shape';
  shape: ShapeType;
  style: ShapeNodeStyle;
}

export type DiagramNode = EntityNode | ShapeNode;
