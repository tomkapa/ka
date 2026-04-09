import { describe, it, expect } from 'vitest';
import { DiagramBuilder } from '../builder/diagram-builder.js';
import { DiagramValidator } from '../schema/validator.js';

const validator = new DiagramValidator();

describe('DiagramBuilder', () => {
  describe('build', () => {
    it('builds a minimal valid diagram', () => {
      const builder = new DiagramBuilder({ name: 'Test Diagram' });
      const diagram = builder.build();

      expect(diagram.version).toBe('1.0');
      expect(diagram.meta.name).toBe('Test Diagram');
      expect(diagram.nodes).toEqual([]);
      expect(diagram.edges).toEqual([]);
    });

    it('passes schema validation', () => {
      const builder = new DiagramBuilder({ name: 'Valid' });
      builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'Box',
        position: { x: 0, y: 0 },
      });
      const diagram = builder.build();
      const result = validator.validate(diagram);
      expect(result.valid).toBe(true);
    });

    it('sets custom canvas dimensions', () => {
      const builder = new DiagramBuilder({
        name: 'Custom',
        width: 1920,
        height: 1080,
      });
      const diagram = builder.build();
      expect(diagram.canvas.width).toBe(1920);
      expect(diagram.canvas.height).toBe(1080);
    });
  });

  describe('addNode', () => {
    it('adds an entity node and returns its ID', () => {
      const builder = new DiagramBuilder();
      const id = builder.addNode({
        type: 'entity',
        entityId: 'postgresql',
        label: 'User DB',
        position: { x: 100, y: 200 },
      });

      expect(id).toBeTruthy();
      const diagram = builder.build();
      expect(diagram.nodes).toHaveLength(1);
      expect(diagram.nodes[0].id).toBe(id);
      expect(diagram.nodes[0].label).toBe('User DB');
    });

    it('adds a shape node and returns its ID', () => {
      const builder = new DiagramBuilder();
      const id = builder.addNode({
        type: 'shape',
        shape: 'diamond',
        label: 'Decision',
        position: { x: 200, y: 300 },
      });

      const diagram = builder.build();
      const node = diagram.nodes.find((n) => n.id === id);
      expect(node).toBeDefined();
      expect(node!.type).toBe('shape');
    });

    it('accepts a custom ID', () => {
      const builder = new DiagramBuilder();
      const id = builder.addNode({
        id: 'my-node',
        type: 'shape',
        shape: 'rectangle',
        label: 'Custom',
        position: { x: 0, y: 0 },
      });
      expect(id).toBe('my-node');
    });

    it('throws on duplicate node ID', () => {
      const builder = new DiagramBuilder();
      builder.addNode({
        id: 'dup',
        type: 'shape',
        shape: 'rectangle',
        label: 'First',
        position: { x: 0, y: 0 },
      });
      expect(() =>
        builder.addNode({
          id: 'dup',
          type: 'shape',
          shape: 'rectangle',
          label: 'Second',
          position: { x: 0, y: 0 },
        }),
      ).toThrow(/duplicate/i);
    });

    it('generates unique IDs for multiple nodes', () => {
      const builder = new DiagramBuilder();
      const id1 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });
      const id2 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'B',
        position: { x: 100, y: 0 },
      });
      expect(id1).not.toBe(id2);
    });

    it('applies default size when not specified', () => {
      const builder = new DiagramBuilder();
      builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });
      const diagram = builder.build();
      expect(diagram.nodes[0].size.width).toBeGreaterThan(0);
      expect(diagram.nodes[0].size.height).toBeGreaterThan(0);
    });
  });

  describe('addEdge', () => {
    it('adds an edge between existing nodes', () => {
      const builder = new DiagramBuilder();
      const n1 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });
      const n2 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'B',
        position: { x: 200, y: 0 },
      });
      const edgeId = builder.addEdge({ source: n1, target: n2 });

      const diagram = builder.build();
      expect(diagram.edges).toHaveLength(1);
      expect(diagram.edges[0].id).toBe(edgeId);
      expect(diagram.edges[0].source).toBe(n1);
      expect(diagram.edges[0].target).toBe(n2);
    });

    it('adds an edge with label and style', () => {
      const builder = new DiagramBuilder();
      const n1 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });
      const n2 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'B',
        position: { x: 200, y: 0 },
      });
      builder.addEdge({
        source: n1,
        target: n2,
        label: 'REST API',
        style: { stroke: '#333', animated: true },
      });

      const diagram = builder.build();
      expect(diagram.edges[0].label).toBe('REST API');
      expect(diagram.edges[0].style.animated).toBe(true);
    });

    it('throws when source node does not exist', () => {
      const builder = new DiagramBuilder();
      const n1 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });
      expect(() =>
        builder.addEdge({ source: 'nonexistent', target: n1 }),
      ).toThrow(/source/i);
    });

    it('throws when target node does not exist', () => {
      const builder = new DiagramBuilder();
      const n1 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });
      expect(() =>
        builder.addEdge({ source: n1, target: 'nonexistent' }),
      ).toThrow(/target/i);
    });
  });

  describe('addAnimationSequence', () => {
    it('adds an animation sequence', () => {
      const builder = new DiagramBuilder();
      const n1 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });
      const n2 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'B',
        position: { x: 200, y: 0 },
      });
      const e1 = builder.addEdge({ source: n1, target: n2 });

      builder.addAnimationSequence({
        name: 'Flow',
        steps: [
          {
            edgeId: e1,
            particleColor: '#2196F3',
            particleSize: 6,
            speed: 1,
            startTime: 0,
            duration: 1500,
          },
        ],
      });

      const diagram = builder.build();
      expect(diagram.animation).toBeDefined();
      expect(diagram.animation!.sequences).toHaveLength(1);
      expect(diagram.animation!.sequences[0].name).toBe('Flow');
    });
  });

  describe('addNodeEffect', () => {
    it('adds a node effect', () => {
      const builder = new DiagramBuilder();
      const n1 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });

      builder.addNodeEffect({
        nodeId: n1,
        effect: 'pulse',
        triggerTime: 0,
        duration: 500,
        color: '#4CAF50',
      });

      const diagram = builder.build();
      expect(diagram.animation).toBeDefined();
      expect(diagram.animation!.nodeEffects).toHaveLength(1);
    });
  });

  describe('toJSON', () => {
    it('produces valid JSON string', () => {
      const builder = new DiagramBuilder({ name: 'JSON Test' });
      const json = builder.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed.meta.name).toBe('JSON Test');
    });

    it('round-trips through parse and validate', () => {
      const builder = new DiagramBuilder({ name: 'Round Trip' });
      const n1 = builder.addNode({
        type: 'entity',
        entityId: 'postgresql',
        label: 'DB',
        position: { x: 0, y: 0 },
      });
      const n2 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'API',
        position: { x: 200, y: 0 },
      });
      builder.addEdge({
        source: n1,
        target: n2,
        label: 'query',
      });

      const json = builder.toJSON();
      const parsed = JSON.parse(json);
      const result = validator.validate(parsed);
      expect(result.valid).toBe(true);
    });
  });
});
