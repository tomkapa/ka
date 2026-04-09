import type {
  Position,
  Size,
  ShapeType,
  EntityNodeStyle,
  ShapeNodeStyle,
  EdgeStyle,
  HandlePosition,
  AnimationStep,
  NodeEffectType,
} from '../types/index.js';

interface BaseNodeInput {
  id?: string;
  label: string;
  position: Position;
  size?: Size;
}

export interface EntityNodeInput extends BaseNodeInput {
  type: 'entity';
  entityId: string;
  style?: Partial<EntityNodeStyle>;
}

export interface ShapeNodeInput extends BaseNodeInput {
  type: 'shape';
  shape: ShapeType;
  style?: Partial<ShapeNodeStyle>;
}

export type NodeInput = EntityNodeInput | ShapeNodeInput;

export interface EdgeInput {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  label?: string;
  style?: Partial<EdgeStyle>;
}

export interface AnimationSequenceInput {
  id?: string;
  name: string;
  steps: AnimationStep[];
}

export interface NodeEffectInput {
  nodeId: string;
  effect: NodeEffectType;
  triggerTime: number;
  duration: number;
  color: string;
}
