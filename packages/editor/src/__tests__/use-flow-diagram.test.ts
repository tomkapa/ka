import { describe, it, expect } from 'vitest';
import {
  diagramToReactFlow,
  reactFlowToDiagram,
} from '../hooks/useFlowDiagram.js';
import { DiagramBuilder } from '@flowdiagram/core';

describe('diagramToReactFlow', () => {
  it('converts nodes to ReactFlow format', () => {
    const builder = new DiagramBuilder({ name: 'Test' });
    builder.addNode({
      id: 'n1',
      type: 'shape',
      shape: 'rectangle',
      label: 'Box A',
      position: { x: 100, y: 200 },
      size: { width: 120, height: 60 },
      style: { fill: '#E3F2FD' },
    });
    builder.addNode({
      id: 'n2',
      type: 'entity',
      entityId: 'postgresql',
      label: 'DB',
      position: { x: 300, y: 200 },
      size: { width: 80, height: 80 },
      style: { labelPosition: 'bottom' },
    });
    const diagram = builder.build();
    const { nodes, edges } = diagramToReactFlow(diagram);

    expect(nodes).toHaveLength(2);
    expect(nodes[0].id).toBe('n1');
    expect(nodes[0].type).toBe('shape');
    expect(nodes[0].position).toEqual({ x: 100, y: 200 });
    expect(nodes[0].data.label).toBe('Box A');
    expect(nodes[0].data.shape).toBe('rectangle');

    expect(nodes[1].id).toBe('n2');
    expect(nodes[1].type).toBe('entity');
    expect(nodes[1].data.entityId).toBe('postgresql');

    expect(edges).toHaveLength(0);
  });

  it('converts edges to ReactFlow format', () => {
    const builder = new DiagramBuilder({ name: 'Test' });
    const n1 = builder.addNode({
      id: 'n1',
      type: 'shape',
      shape: 'rectangle',
      label: 'A',
      position: { x: 0, y: 0 },
    });
    const n2 = builder.addNode({
      id: 'n2',
      type: 'shape',
      shape: 'rectangle',
      label: 'B',
      position: { x: 200, y: 0 },
    });
    builder.addEdge({
      id: 'e1',
      source: n1,
      target: n2,
      label: 'connects',
      style: { animated: true, type: 'smoothstep' },
    });
    const diagram = builder.build();
    const { edges } = diagramToReactFlow(diagram);

    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe('e1');
    expect(edges[0].source).toBe('n1');
    expect(edges[0].target).toBe('n2');
    expect(edges[0].label).toBe('connects');
    expect(edges[0].animated).toBe(true);
    expect(edges[0].type).toBe('smoothstep');
  });
});

describe('reactFlowToDiagram', () => {
  it('round-trips diagram -> ReactFlow -> diagram', () => {
    const builder = new DiagramBuilder({ name: 'Round Trip' });
    builder.addNode({
      id: 'n1',
      type: 'shape',
      shape: 'rectangle',
      label: 'A',
      position: { x: 100, y: 200 },
      size: { width: 120, height: 60 },
    });
    builder.addNode({
      id: 'n2',
      type: 'entity',
      entityId: 'postgresql',
      label: 'DB',
      position: { x: 300, y: 200 },
      size: { width: 80, height: 80 },
    });
    builder.addEdge({
      id: 'e1',
      source: 'n1',
      target: 'n2',
      label: 'query',
    });
    const original = builder.build();

    const { nodes, edges } = diagramToReactFlow(original);
    const restored = reactFlowToDiagram(nodes, edges, original);

    expect(restored.nodes).toHaveLength(2);
    expect(restored.edges).toHaveLength(1);
    expect(restored.nodes[0].id).toBe('n1');
    expect(restored.nodes[0].position).toEqual({ x: 100, y: 200 });
    expect(restored.edges[0].source).toBe('n1');
    expect(restored.edges[0].target).toBe('n2');
  });
});
