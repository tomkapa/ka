import { describe, it, expect } from 'vitest';
import { AnimationTimeline } from '../animation/timeline.js';
import type {
  AnimationConfig,
  DiagramEdge,
  DiagramNode,
} from '../types/index.js';

const nodes: DiagramNode[] = [
  {
    id: 'n1',
    type: 'shape',
    shape: 'rectangle',
    label: 'A',
    position: { x: 0, y: 0 },
    size: { width: 120, height: 60 },
    style: {},
  },
  {
    id: 'n2',
    type: 'shape',
    shape: 'rectangle',
    label: 'B',
    position: { x: 300, y: 0 },
    size: { width: 120, height: 60 },
    style: {},
  },
  {
    id: 'n3',
    type: 'shape',
    shape: 'rectangle',
    label: 'C',
    position: { x: 600, y: 0 },
    size: { width: 120, height: 60 },
    style: {},
  },
];

const edges: DiagramEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', style: {} },
  { id: 'e2', source: 'n2', target: 'n3', style: {} },
];

function makeConfig(overrides?: Partial<AnimationConfig>): AnimationConfig {
  return {
    type: 'flow',
    duration: 3000,
    fps: 12,
    loop: true,
    sequences: [
      {
        id: 'seq1',
        name: 'Flow',
        steps: [
          {
            edgeId: 'e1',
            particleColor: '#2196F3',
            particleSize: 6,
            speed: 1.0,
            startTime: 0,
            duration: 1500,
          },
          {
            edgeId: 'e2',
            particleColor: '#4CAF50',
            particleSize: 4,
            speed: 1.0,
            startTime: 1500,
            duration: 1500,
          },
        ],
      },
    ],
    nodeEffects: [
      {
        nodeId: 'n2',
        effect: 'pulse',
        triggerTime: 1500,
        duration: 500,
        color: '#4CAF50',
      },
    ],
    ...overrides,
  };
}

describe('AnimationTimeline', () => {
  describe('constructor', () => {
    it('creates a timeline from animation config', () => {
      const timeline = new AnimationTimeline(makeConfig());
      expect(timeline.duration).toBe(3000);
      expect(timeline.fps).toBe(12);
    });

    it('computes total frame count', () => {
      const timeline = new AnimationTimeline(makeConfig());
      // 3000ms at 12fps = 36 frames
      expect(timeline.totalFrames).toBe(36);
    });
  });

  describe('getStateAtTime - particles', () => {
    it('returns particle for active edge at time within step range', () => {
      const timeline = new AnimationTimeline(makeConfig());
      const state = timeline.getStateAtTime(750);

      expect(state.particles).toHaveLength(1);
      expect(state.particles[0].edgeId).toBe('e1');
      expect(state.particles[0].color).toBe('#2196F3');
      expect(state.particles[0].size).toBe(6);
    });

    it('computes progress correctly at midpoint', () => {
      const timeline = new AnimationTimeline(makeConfig());
      const state = timeline.getStateAtTime(750);

      // 750ms into a 1500ms step = 50% progress
      expect(state.particles[0].progress).toBeCloseTo(0.5, 1);
    });

    it('returns progress 0 at step start', () => {
      const timeline = new AnimationTimeline(makeConfig());
      const state = timeline.getStateAtTime(0);

      expect(state.particles).toHaveLength(1);
      expect(state.particles[0].progress).toBeCloseTo(0, 1);
    });

    it('returns particle for second step at its start time', () => {
      const timeline = new AnimationTimeline(makeConfig());
      const state = timeline.getStateAtTime(1500);

      // e1 step ended, e2 step just started
      const e2Particles = state.particles.filter((p) => p.edgeId === 'e2');
      expect(e2Particles).toHaveLength(1);
      expect(e2Particles[0].progress).toBeCloseTo(0, 1);
    });

    it('returns no particles for time before any step', () => {
      const config = makeConfig({
        sequences: [
          {
            id: 'seq1',
            name: 'Delayed',
            steps: [
              {
                edgeId: 'e1',
                particleColor: '#fff',
                particleSize: 4,
                speed: 1,
                startTime: 1000,
                duration: 1000,
              },
            ],
          },
        ],
      });
      const timeline = new AnimationTimeline(config);
      const state = timeline.getStateAtTime(500);
      expect(state.particles).toHaveLength(0);
    });

    it('returns no particles after step ends (non-looping step)', () => {
      const timeline = new AnimationTimeline(makeConfig());
      // Time 1499 is just before step 1 ends
      const stateJustBefore = timeline.getStateAtTime(1499);
      const e1Before = stateJustBefore.particles.filter(
        (p) => p.edgeId === 'e1',
      );
      expect(e1Before).toHaveLength(1);

      // Time 1500 is when step 1 ends and step 2 starts
      const stateAt1500 = timeline.getStateAtTime(1500);
      const e1After = stateAt1500.particles.filter(
        (p) => p.edgeId === 'e1',
      );
      expect(e1After).toHaveLength(0);
    });
  });

  describe('getStateAtTime - node effects', () => {
    it('returns active node effect during trigger window', () => {
      const timeline = new AnimationTimeline(makeConfig());
      const state = timeline.getStateAtTime(1700);

      expect(state.nodeEffects).toHaveLength(1);
      expect(state.nodeEffects[0].nodeId).toBe('n2');
      expect(state.nodeEffects[0].effect).toBe('pulse');
      expect(state.nodeEffects[0].color).toBe('#4CAF50');
    });

    it('computes effect intensity based on progress', () => {
      const timeline = new AnimationTimeline(makeConfig());
      // 1750ms: 250ms into a 500ms effect = 50%
      const state = timeline.getStateAtTime(1750);

      expect(state.nodeEffects[0].intensity).toBeCloseTo(0.5, 1);
    });

    it('returns no effects before trigger time', () => {
      const timeline = new AnimationTimeline(makeConfig());
      const state = timeline.getStateAtTime(1000);
      expect(state.nodeEffects).toHaveLength(0);
    });

    it('returns no effects after trigger + duration', () => {
      const timeline = new AnimationTimeline(makeConfig());
      // Effect ends at 1500 + 500 = 2000ms
      const state = timeline.getStateAtTime(2001);
      expect(state.nodeEffects).toHaveLength(0);
    });
  });

  describe('loop wrapping', () => {
    it('wraps time back to start when looping', () => {
      const timeline = new AnimationTimeline(makeConfig());
      // At 3000ms (duration), wraps to 0ms
      const stateAt0 = timeline.getStateAtTime(0);
      const stateAtWrap = timeline.getStateAtTime(3000);

      expect(stateAtWrap.particles).toEqual(stateAt0.particles);
    });

    it('wraps time for values greater than duration', () => {
      const timeline = new AnimationTimeline(makeConfig());
      // 3750ms wraps to 750ms
      const stateAt750 = timeline.getStateAtTime(750);
      const stateAtWrap = timeline.getStateAtTime(3750);

      expect(stateAtWrap.particles[0].progress).toBeCloseTo(
        stateAt750.particles[0].progress,
        1,
      );
    });

    it('does not wrap when loop is false', () => {
      const config = makeConfig({ loop: false });
      const timeline = new AnimationTimeline(config);
      // At time > duration, everything is inactive
      const state = timeline.getStateAtTime(4000);

      expect(state.particles).toHaveLength(0);
      expect(state.nodeEffects).toHaveLength(0);
    });
  });

  describe('multiple sequences', () => {
    it('handles particles from multiple sequences simultaneously', () => {
      const config = makeConfig({
        sequences: [
          {
            id: 'seq1',
            name: 'Flow A',
            steps: [
              {
                edgeId: 'e1',
                particleColor: '#red',
                particleSize: 4,
                speed: 1,
                startTime: 0,
                duration: 2000,
              },
            ],
          },
          {
            id: 'seq2',
            name: 'Flow B',
            steps: [
              {
                edgeId: 'e2',
                particleColor: '#blue',
                particleSize: 4,
                speed: 1,
                startTime: 500,
                duration: 2000,
              },
            ],
          },
        ],
      });
      const timeline = new AnimationTimeline(config);
      const state = timeline.getStateAtTime(1000);

      // Both sequences active at t=1000
      expect(state.particles).toHaveLength(2);
      const edgeIds = state.particles.map((p) => p.edgeId);
      expect(edgeIds).toContain('e1');
      expect(edgeIds).toContain('e2');
    });
  });

  describe('getFrameState', () => {
    it('returns state for a specific frame index', () => {
      const timeline = new AnimationTimeline(makeConfig());
      // Frame 0 = 0ms, Frame 6 = 500ms (at 12fps)
      const state = timeline.getFrameState(6);
      expect(state.particles.length).toBeGreaterThan(0);
    });

    it('clamps frame index to valid range', () => {
      const timeline = new AnimationTimeline(makeConfig());
      // Negative frame should clamp to 0
      const state = timeline.getFrameState(-1);
      expect(state).toBeDefined();

      // Frame beyond total should clamp/wrap
      const stateBeyond = timeline.getFrameState(100);
      expect(stateBeyond).toBeDefined();
    });
  });
});
