import { describe, it, expect } from 'vitest';
import { DiagramValidator } from '../schema/validator.js';
import type { FlowDiagram } from '../types/index.js';

const validator = new DiagramValidator();

function minimalDiagram(): FlowDiagram {
  return {
    version: '1.0',
    meta: { name: 'Test', created: '2026-04-09T10:00:00Z', author: 'test' },
    canvas: { width: 1200, height: 800, background: '#ffffff' },
    entities: { registry: 'default', embedded: [] },
    nodes: [],
    edges: [],
  };
}

function diagramWithNodesAndEdges(): FlowDiagram {
  return {
    ...minimalDiagram(),
    nodes: [
      {
        id: 'n1',
        type: 'entity',
        entityId: 'database',
        label: 'DB',
        position: { x: 0, y: 0 },
        size: { width: 80, height: 80 },
        style: {},
      },
      {
        id: 'n2',
        type: 'shape',
        shape: 'rectangle',
        label: 'API',
        position: { x: 200, y: 0 },
        size: { width: 120, height: 60 },
        style: {},
      },
    ],
    edges: [
      {
        id: 'e1',
        source: 'n1',
        target: 'n2',
        style: {},
      },
    ],
  };
}

describe('DiagramValidator', () => {
  describe('valid diagrams', () => {
    it('accepts a minimal valid diagram', () => {
      const result = validator.validate(minimalDiagram());
      expect(result.valid).toBe(true);
    });

    it('accepts a diagram with nodes and edges', () => {
      const result = validator.validate(diagramWithNodesAndEdges());
      expect(result.valid).toBe(true);
    });

    it('accepts a diagram with animation config', () => {
      const diagram = {
        ...diagramWithNodesAndEdges(),
        animation: {
          type: 'flow' as const,
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
              ],
            },
          ],
          nodeEffects: [],
        },
      };
      const result = validator.validate(diagram);
      expect(result.valid).toBe(true);
    });

    it('returns the parsed diagram on success', () => {
      const diagram = minimalDiagram();
      const result = validator.validate(diagram);
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.diagram).toEqual(diagram);
      }
    });
  });

  describe('missing required fields', () => {
    it('fails when version is missing', () => {
      const { version: _, ...noVersion } = minimalDiagram();
      const result = validator.validate(noVersion);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it('fails when meta is missing', () => {
      const { meta: _, ...noMeta } = minimalDiagram();
      const result = validator.validate(noMeta);
      expect(result.valid).toBe(false);
    });

    it('fails when canvas is missing', () => {
      const { canvas: _, ...noCanvas } = minimalDiagram();
      const result = validator.validate(noCanvas);
      expect(result.valid).toBe(false);
    });

    it('fails when nodes is missing', () => {
      const { nodes: _, ...noNodes } = minimalDiagram();
      const result = validator.validate(noNodes);
      expect(result.valid).toBe(false);
    });

    it('fails when edges is missing', () => {
      const { edges: _, ...noEdges } = minimalDiagram();
      const result = validator.validate(noEdges);
      expect(result.valid).toBe(false);
    });
  });

  describe('invalid node types', () => {
    it('fails when node type is invalid', () => {
      const diagram = {
        ...minimalDiagram(),
        nodes: [
          {
            id: 'n1',
            type: 'invalid',
            label: 'Bad',
            position: { x: 0, y: 0 },
            size: { width: 80, height: 80 },
            style: {},
          },
        ],
      };
      const result = validator.validate(diagram);
      expect(result.valid).toBe(false);
    });
  });

  describe('cross-reference validation', () => {
    it('fails when edge references non-existent source node', () => {
      const diagram = {
        ...minimalDiagram(),
        nodes: [
          {
            id: 'n1',
            type: 'shape' as const,
            shape: 'rectangle' as const,
            label: 'A',
            position: { x: 0, y: 0 },
            size: { width: 80, height: 80 },
            style: {},
          },
        ],
        edges: [
          { id: 'e1', source: 'nonexistent', target: 'n1', style: {} },
        ],
      };
      const result = validator.validate(diagram);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.message.includes('source'))).toBe(
          true,
        );
      }
    });

    it('fails when edge references non-existent target node', () => {
      const diagram = {
        ...minimalDiagram(),
        nodes: [
          {
            id: 'n1',
            type: 'shape' as const,
            shape: 'rectangle' as const,
            label: 'A',
            position: { x: 0, y: 0 },
            size: { width: 80, height: 80 },
            style: {},
          },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'nonexistent', style: {} },
        ],
      };
      const result = validator.validate(diagram);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.message.includes('target'))).toBe(
          true,
        );
      }
    });

    it('fails when animation references non-existent edge', () => {
      const diagram = {
        ...diagramWithNodesAndEdges(),
        animation: {
          type: 'flow' as const,
          duration: 3000,
          fps: 12,
          loop: true,
          sequences: [
            {
              id: 'seq1',
              name: 'Flow',
              steps: [
                {
                  edgeId: 'nonexistent',
                  particleColor: '#fff',
                  particleSize: 6,
                  speed: 1,
                  startTime: 0,
                  duration: 1000,
                },
              ],
            },
          ],
          nodeEffects: [],
        },
      };
      const result = validator.validate(diagram);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.message.includes('edgeId'))).toBe(
          true,
        );
      }
    });

    it('fails when node effect references non-existent node', () => {
      const diagram = {
        ...diagramWithNodesAndEdges(),
        animation: {
          type: 'flow' as const,
          duration: 3000,
          fps: 12,
          loop: true,
          sequences: [],
          nodeEffects: [
            {
              nodeId: 'nonexistent',
              effect: 'pulse' as const,
              triggerTime: 0,
              duration: 500,
              color: '#fff',
            },
          ],
        },
      };
      const result = validator.validate(diagram);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.message.includes('nodeId'))).toBe(
          true,
        );
      }
    });
  });

  describe('error details', () => {
    it('provides path and message for validation errors', () => {
      const result = validator.validate({});
      expect(result.valid).toBe(false);
      if (!result.valid) {
        for (const error of result.errors) {
          expect(error).toHaveProperty('path');
          expect(error).toHaveProperty('message');
          expect(typeof error.path).toBe('string');
          expect(typeof error.message).toBe('string');
        }
      }
    });
  });
});
