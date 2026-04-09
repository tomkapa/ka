import Ajv, { type ValidateFunction, type ErrorObject } from 'ajv';
import type { FlowDiagram } from '../types/index.js';

// Inline the schema to avoid Node.js filesystem dependencies.
// This makes the validator usable in both Node.js and browser contexts.
const flowDiagramSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://flowdiagram.dev/schemas/flow-diagram.json',
  title: 'FlowDiagram',
  type: 'object',
  required: ['version', 'meta', 'canvas', 'entities', 'nodes', 'edges'],
  additionalProperties: true,
  properties: {
    version: { type: 'string' },
    meta: { $ref: '#/$defs/Meta' },
    canvas: { $ref: '#/$defs/Canvas' },
    entities: { $ref: '#/$defs/EntityConfig' },
    nodes: { type: 'array', items: { $ref: '#/$defs/Node' } },
    edges: { type: 'array', items: { $ref: '#/$defs/Edge' } },
    animation: { $ref: '#/$defs/AnimationConfig' },
  },
  $defs: {
    Meta: {
      type: 'object',
      required: ['name', 'created', 'author'],
      properties: {
        name: { type: 'string' },
        created: { type: 'string' },
        author: { type: 'string' },
      },
      additionalProperties: true,
    },
    Canvas: {
      type: 'object',
      required: ['width', 'height', 'background'],
      properties: {
        width: { type: 'number', minimum: 1 },
        height: { type: 'number', minimum: 1 },
        background: { type: 'string' },
      },
      additionalProperties: true,
    },
    EntityConfig: {
      type: 'object',
      required: ['registry', 'embedded'],
      properties: {
        registry: { type: 'string' },
        embedded: {
          type: 'array',
          items: { $ref: '#/$defs/EmbeddedEntity' },
        },
      },
      additionalProperties: true,
    },
    EmbeddedEntity: {
      type: 'object',
      required: ['id', 'name', 'image', 'tags'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        image: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      additionalProperties: true,
    },
    Position: {
      type: 'object',
      required: ['x', 'y'],
      properties: { x: { type: 'number' }, y: { type: 'number' } },
      additionalProperties: false,
    },
    Size: {
      type: 'object',
      required: ['width', 'height'],
      properties: {
        width: { type: 'number', minimum: 0 },
        height: { type: 'number', minimum: 0 },
      },
      additionalProperties: false,
    },
    Node: {
      type: 'object',
      required: ['id', 'type', 'label', 'position', 'size', 'style'],
      oneOf: [
        { $ref: '#/$defs/EntityNode' },
        { $ref: '#/$defs/ShapeNode' },
      ],
    },
    EntityNode: {
      type: 'object',
      required: [
        'id',
        'type',
        'entityId',
        'label',
        'position',
        'size',
        'style',
      ],
      properties: {
        id: { type: 'string' },
        type: { const: 'entity' },
        entityId: { type: 'string' },
        label: { type: 'string' },
        position: { $ref: '#/$defs/Position' },
        size: { $ref: '#/$defs/Size' },
        style: { type: 'object', additionalProperties: true },
      },
      additionalProperties: false,
    },
    ShapeNode: {
      type: 'object',
      required: [
        'id',
        'type',
        'shape',
        'label',
        'position',
        'size',
        'style',
      ],
      properties: {
        id: { type: 'string' },
        type: { const: 'shape' },
        shape: {
          type: 'string',
          enum: ['rectangle', 'diamond', 'circle', 'ellipse', 'hexagon'],
        },
        label: { type: 'string' },
        position: { $ref: '#/$defs/Position' },
        size: { $ref: '#/$defs/Size' },
        style: { type: 'object', additionalProperties: true },
      },
      additionalProperties: false,
    },
    Edge: {
      type: 'object',
      required: ['id', 'source', 'target', 'style'],
      properties: {
        id: { type: 'string' },
        source: { type: 'string' },
        target: { type: 'string' },
        sourceHandle: {
          type: 'string',
          enum: ['top', 'right', 'bottom', 'left'],
        },
        targetHandle: {
          type: 'string',
          enum: ['top', 'right', 'bottom', 'left'],
        },
        label: { type: 'string' },
        style: { type: 'object', additionalProperties: true },
      },
      additionalProperties: true,
    },
    AnimationConfig: {
      type: 'object',
      required: ['type', 'duration', 'fps', 'loop', 'sequences', 'nodeEffects'],
      properties: {
        type: { type: 'string', enum: ['flow', 'sequence', 'custom'] },
        duration: { type: 'number', minimum: 0 },
        fps: { type: 'number', minimum: 1, maximum: 60 },
        loop: { type: 'boolean' },
        sequences: {
          type: 'array',
          items: { $ref: '#/$defs/AnimationSequence' },
        },
        nodeEffects: {
          type: 'array',
          items: { $ref: '#/$defs/NodeEffect' },
        },
      },
      additionalProperties: true,
    },
    AnimationSequence: {
      type: 'object',
      required: ['id', 'name', 'steps'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        steps: {
          type: 'array',
          items: { $ref: '#/$defs/AnimationStep' },
        },
      },
      additionalProperties: true,
    },
    AnimationStep: {
      type: 'object',
      required: [
        'edgeId',
        'particleColor',
        'particleSize',
        'speed',
        'startTime',
        'duration',
      ],
      properties: {
        edgeId: { type: 'string' },
        particleColor: { type: 'string' },
        particleSize: { type: 'number', minimum: 0 },
        speed: { type: 'number', minimum: 0 },
        startTime: { type: 'number', minimum: 0 },
        duration: { type: 'number', minimum: 0 },
      },
      additionalProperties: true,
    },
    NodeEffect: {
      type: 'object',
      required: ['nodeId', 'effect', 'triggerTime', 'duration', 'color'],
      properties: {
        nodeId: { type: 'string' },
        effect: { type: 'string', enum: ['pulse', 'glow', 'highlight'] },
        triggerTime: { type: 'number', minimum: 0 },
        duration: { type: 'number', minimum: 0 },
        color: { type: 'string' },
      },
      additionalProperties: true,
    },
  },
} as const;

export interface ValidationError {
  path: string;
  message: string;
}

export type ValidationResult =
  | { valid: true; diagram: FlowDiagram }
  | { valid: false; errors: ValidationError[] };

const compiledSchema: ValidateFunction = new Ajv.default({
  allErrors: true,
  strict: false,
}).compile(flowDiagramSchema);

export class DiagramValidator {
  private readonly validateSchema: ValidateFunction = compiledSchema;


  validate(data: unknown): ValidationResult {
    const schemaValid = this.validateSchema(data);

    if (!schemaValid) {
      const errors: ValidationError[] = (
        (this.validateSchema.errors ?? []) as ErrorObject[]
      ).map((err) => ({
        path: err.instancePath || '/',
        message: err.message ?? 'Unknown validation error',
      }));
      return { valid: false, errors };
    }

    const diagram = data as FlowDiagram;
    const crossRefErrors = this.validateCrossReferences(diagram);

    if (crossRefErrors.length > 0) {
      return { valid: false, errors: crossRefErrors };
    }

    return { valid: true, diagram };
  }

  private validateCrossReferences(diagram: FlowDiagram): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeIds = new Set(diagram.nodes.map((n) => n.id));
    const edgeIds = new Set(diagram.edges.map((e) => e.id));

    for (const edge of diagram.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push({
          path: `/edges/${edge.id}`,
          message: `Edge "${edge.id}" source "${edge.source}" does not reference an existing node`,
        });
      }
      if (!nodeIds.has(edge.target)) {
        errors.push({
          path: `/edges/${edge.id}`,
          message: `Edge "${edge.id}" target "${edge.target}" does not reference an existing node`,
        });
      }
    }

    if (diagram.animation) {
      for (const seq of diagram.animation.sequences) {
        for (const step of seq.steps) {
          if (!edgeIds.has(step.edgeId)) {
            errors.push({
              path: `/animation/sequences/${seq.id}/steps`,
              message: `Animation step edgeId "${step.edgeId}" does not reference an existing edge`,
            });
          }
        }
      }
      for (const effect of diagram.animation.nodeEffects) {
        if (!nodeIds.has(effect.nodeId)) {
          errors.push({
            path: `/animation/nodeEffects`,
            message: `Node effect nodeId "${effect.nodeId}" does not reference an existing node`,
          });
        }
      }
    }

    return errors;
  }
}
