import type {
  AnimationConfig,
  AnimationStep,
  NodeEffect,
  NodeEffectType,
} from '../types/index.js';

export interface ParticleState {
  edgeId: string;
  progress: number;
  color: string;
  size: number;
}

export interface NodeEffectState {
  nodeId: string;
  effect: NodeEffectType;
  intensity: number;
  color: string;
}

export interface AnimationFrameState {
  particles: ParticleState[];
  nodeEffects: NodeEffectState[];
}

const EMPTY_FRAME: AnimationFrameState = { particles: [], nodeEffects: [] };

export class AnimationTimeline {
  private readonly config: AnimationConfig;
  private readonly allSteps: AnimationStep[];
  private readonly allEffects: NodeEffect[];

  constructor(config: AnimationConfig) {
    this.config = config;
    this.allSteps = config.sequences.flatMap((seq) => seq.steps);
    this.allEffects = config.nodeEffects;
  }

  get duration(): number {
    return this.config.duration;
  }

  get fps(): number {
    return this.config.fps;
  }

  get totalFrames(): number {
    return Math.round((this.config.duration / 1000) * this.config.fps);
  }

  getStateAtTime(timeMs: number): AnimationFrameState {
    const resolvedTime = this.resolveTime(timeMs);

    if (resolvedTime < 0) {
      return EMPTY_FRAME;
    }

    return {
      particles: this.computeParticles(resolvedTime),
      nodeEffects: this.computeNodeEffects(resolvedTime),
    };
  }

  getFrameState(frameIndex: number): AnimationFrameState {
    const clampedFrame = Math.max(0, frameIndex);
    const msPerFrame = 1000 / this.config.fps;
    const timeMs = clampedFrame * msPerFrame;
    return this.getStateAtTime(timeMs);
  }

  private resolveTime(timeMs: number): number {
    if (timeMs < 0) {
      return this.config.loop ? ((timeMs % this.config.duration) + this.config.duration) % this.config.duration : 0;
    }

    if (timeMs >= this.config.duration) {
      if (this.config.loop) {
        return timeMs % this.config.duration;
      }
      return -1; // Signal: past end, not looping
    }

    return timeMs;
  }

  private computeParticles(timeMs: number): ParticleState[] {
    const particles: ParticleState[] = [];

    for (const step of this.allSteps) {
      const stepEnd = step.startTime + step.duration;

      if (timeMs >= step.startTime && timeMs < stepEnd) {
        const elapsed = timeMs - step.startTime;
        const progress = (elapsed / step.duration) * step.speed;

        particles.push({
          edgeId: step.edgeId,
          progress: Math.min(progress, 1),
          color: step.particleColor,
          size: step.particleSize,
        });
      }
    }

    return particles;
  }

  private computeNodeEffects(timeMs: number): NodeEffectState[] {
    const effects: NodeEffectState[] = [];

    for (const effect of this.allEffects) {
      const effectEnd = effect.triggerTime + effect.duration;

      if (timeMs >= effect.triggerTime && timeMs < effectEnd) {
        const elapsed = timeMs - effect.triggerTime;
        const intensity = elapsed / effect.duration;

        effects.push({
          nodeId: effect.nodeId,
          effect: effect.effect,
          intensity: Math.min(intensity, 1),
          color: effect.color,
        });
      }
    }

    return effects;
  }
}
