export type AnimationType = 'flow' | 'sequence' | 'custom';
export type NodeEffectType = 'pulse' | 'glow' | 'highlight';

export interface AnimationStep {
  edgeId: string;
  particleColor: string;
  particleSize: number;
  speed: number;
  startTime: number;
  duration: number;
}

export interface AnimationSequence {
  id: string;
  name: string;
  steps: AnimationStep[];
}

export interface NodeEffect {
  nodeId: string;
  effect: NodeEffectType;
  triggerTime: number;
  duration: number;
  color: string;
}

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  fps: number;
  loop: boolean;
  sequences: AnimationSequence[];
  nodeEffects: NodeEffect[];
}
