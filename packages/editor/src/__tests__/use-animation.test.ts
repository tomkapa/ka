import { describe, it, expect } from 'vitest';
import {
  AnimationTimeline,
  type AnimationConfig,
  type DiagramEdge,
  type DiagramNode,
} from '@flowdiagram/core';

// Test the AnimationTimeline integration that useAnimation depends on.
// The hook itself uses requestAnimationFrame which requires a browser env;
// we test the pure computation layer here.

const nodes: DiagramNode[] = [
  { id: 'n1', type: 'shape', shape: 'rectangle', label: 'A', position: { x: 0, y: 0 }, size: { width: 120, height: 60 }, style: {} },
  { id: 'n2', type: 'shape', shape: 'rectangle', label: 'B', position: { x: 300, y: 0 }, size: { width: 120, height: 60 }, style: {} },
];

const edges: DiagramEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', style: {} },
];

const config: AnimationConfig = {
  type: 'flow',
  duration: 2000,
  fps: 10,
  loop: true,
  sequences: [{
    id: 'seq1',
    name: 'Flow',
    steps: [{
      edgeId: 'e1',
      particleColor: '#2196F3',
      particleSize: 6,
      speed: 1.0,
      startTime: 0,
      duration: 2000,
    }],
  }],
  nodeEffects: [{
    nodeId: 'n1',
    effect: 'pulse',
    triggerTime: 500,
    duration: 1000,
    color: '#4CAF50',
  }],
};

describe('Animation integration for useAnimation', () => {
  it('timeline produces frame states for animation rendering', () => {
    const timeline = new AnimationTimeline(config);

    // Simulate rAF-driven animation: get state at each frame
    const states = Array.from({ length: timeline.totalFrames }, (_, i) =>
      timeline.getFrameState(i),
    );

    // Every frame should have at least one particle (step covers full duration)
    for (const state of states) {
      expect(state.particles.length).toBeGreaterThanOrEqual(1);
      expect(state.particles[0].edgeId).toBe('e1');
      expect(state.particles[0].progress).toBeGreaterThanOrEqual(0);
      expect(state.particles[0].progress).toBeLessThanOrEqual(1);
    }
  });

  it('node effects appear only during their window', () => {
    const timeline = new AnimationTimeline(config);

    // At frame 2 = 200ms, effect not yet started (starts at 500ms)
    const earlyState = timeline.getFrameState(2);
    expect(earlyState.nodeEffects).toHaveLength(0);

    // At frame 10 = 1000ms, effect is active (500-1500ms)
    const midState = timeline.getFrameState(10);
    expect(midState.nodeEffects).toHaveLength(1);
    expect(midState.nodeEffects[0].nodeId).toBe('n1');

    // At frame 18 = 1800ms, effect ended (ended at 1500ms)
    const lateState = timeline.getFrameState(18);
    expect(lateState.nodeEffects).toHaveLength(0);
  });
});
