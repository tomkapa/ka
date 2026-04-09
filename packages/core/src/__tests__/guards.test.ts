import { describe, it, expect } from 'vitest';
import { isEntityNode, isShapeNode, isFlowDiagram } from '../guards.js';
import type {
  EntityNode,
  ShapeNode,
  DiagramNode,
  FlowDiagram,
} from '../types/index.js';

const entityNode: EntityNode = {
  id: 'n1',
  type: 'entity',
  entityId: 'database',
  label: 'User DB',
  position: { x: 100, y: 200 },
  size: { width: 80, height: 80 },
  style: { labelPosition: 'bottom' },
};

const shapeNode: ShapeNode = {
  id: 'n2',
  type: 'shape',
  shape: 'rectangle',
  label: 'API Gateway',
  position: { x: 300, y: 200 },
  size: { width: 120, height: 60 },
  style: { fill: '#E3F2FD' },
};

const validDiagram: FlowDiagram = {
  version: '1.0',
  meta: { name: 'Test', created: '2026-04-09T10:00:00Z', author: 'test' },
  canvas: { width: 1200, height: 800, background: '#ffffff' },
  entities: { registry: 'default', embedded: [] },
  nodes: [entityNode, shapeNode],
  edges: [
    {
      id: 'e1',
      source: 'n1',
      target: 'n2',
      style: { stroke: '#666', type: 'smoothstep' },
    },
  ],
};

describe('isEntityNode', () => {
  it('returns true for entity nodes', () => {
    expect(isEntityNode(entityNode)).toBe(true);
  });

  it('returns false for shape nodes', () => {
    expect(isEntityNode(shapeNode)).toBe(false);
  });

  it('narrows the type correctly', () => {
    const node: DiagramNode = entityNode;
    if (isEntityNode(node)) {
      // TypeScript should allow accessing entityId here
      expect(node.entityId).toBe('database');
    }
  });
});

describe('isShapeNode', () => {
  it('returns true for shape nodes', () => {
    expect(isShapeNode(shapeNode)).toBe(true);
  });

  it('returns false for entity nodes', () => {
    expect(isShapeNode(entityNode)).toBe(false);
  });

  it('narrows the type correctly', () => {
    const node: DiagramNode = shapeNode;
    if (isShapeNode(node)) {
      expect(node.shape).toBe('rectangle');
    }
  });
});

describe('isFlowDiagram', () => {
  it('returns true for a valid diagram object', () => {
    expect(isFlowDiagram(validDiagram)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isFlowDiagram(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isFlowDiagram(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isFlowDiagram('not a diagram')).toBe(false);
  });

  it('returns false for an object missing required fields', () => {
    expect(isFlowDiagram({ version: '1.0' })).toBe(false);
    expect(isFlowDiagram({ version: '1.0', meta: {} })).toBe(false);
  });

  it('returns false when nodes is not an array', () => {
    expect(isFlowDiagram({ ...validDiagram, nodes: 'not an array' })).toBe(
      false,
    );
  });

  it('returns false when edges is not an array', () => {
    expect(isFlowDiagram({ ...validDiagram, edges: 'not an array' })).toBe(
      false,
    );
  });
});
