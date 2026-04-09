import type {
  FlowDiagram,
  DiagramNode,
  DiagramEdge,
  AnimationConfig,
  AnimationSequence,
  NodeEffect,
} from '../types/index.js';
import type {
  NodeInput,
  EdgeInput,
  AnimationSequenceInput,
  NodeEffectInput,
} from './types.js';
import {
  DEFAULT_CANVAS,
  DEFAULT_NODE_SIZE,
  DEFAULT_ENTITY_NODE_SIZE,
  DEFAULT_EDGE_STYLE,
} from './defaults.js';

export function generateId(): string {
  return globalThis.crypto.randomUUID().slice(0, 8);
}

export interface DiagramBuilderOptions {
  name?: string;
  width?: number;
  height?: number;
}

export class DiagramBuilder {
  private readonly name: string;
  private readonly width: number;
  private readonly height: number;
  private readonly nodes: DiagramNode[] = [];
  private readonly edges: DiagramEdge[] = [];
  private readonly sequences: AnimationSequence[] = [];
  private readonly nodeEffects: NodeEffect[] = [];
  private readonly nodeIds = new Set<string>();
  private readonly edgeIds = new Set<string>();

  constructor(options?: DiagramBuilderOptions) {
    this.name = options?.name ?? 'Untitled';
    this.width = options?.width ?? DEFAULT_CANVAS.width;
    this.height = options?.height ?? DEFAULT_CANVAS.height;
  }

  addNode(input: NodeInput): string {
    const id = input.id ?? `n-${generateId()}`;

    if (this.nodeIds.has(id)) {
      throw new Error(`Duplicate node ID: "${id}"`);
    }

    const node = this.buildNode(id, input);
    this.nodes.push(node);
    this.nodeIds.add(id);
    return id;
  }

  addEdge(input: EdgeInput): string {
    if (!this.nodeIds.has(input.source)) {
      throw new Error(
        `Edge source "${input.source}" does not reference an existing node`,
      );
    }
    if (!this.nodeIds.has(input.target)) {
      throw new Error(
        `Edge target "${input.target}" does not reference an existing node`,
      );
    }

    const id = input.id ?? `e-${generateId()}`;

    if (this.edgeIds.has(id)) {
      throw new Error(`Duplicate edge ID: "${id}"`);
    }

    const edge: DiagramEdge = {
      id,
      source: input.source,
      target: input.target,
      sourceHandle: input.sourceHandle,
      targetHandle: input.targetHandle,
      label: input.label,
      style: { ...DEFAULT_EDGE_STYLE, ...input.style },
    };

    this.edges.push(edge);
    this.edgeIds.add(id);
    return id;
  }

  addAnimationSequence(input: AnimationSequenceInput): string {
    const id = input.id ?? `seq-${generateId()}`;
    this.sequences.push({
      id,
      name: input.name,
      steps: input.steps,
    });
    return id;
  }

  addNodeEffect(input: NodeEffectInput): void {
    this.nodeEffects.push({
      nodeId: input.nodeId,
      effect: input.effect,
      triggerTime: input.triggerTime,
      duration: input.duration,
      color: input.color,
    });
  }

  build(): FlowDiagram {
    const diagram: FlowDiagram = {
      version: '1.0',
      meta: {
        name: this.name,
        created: new Date().toISOString(),
        author: 'FlowDiagram Builder',
      },
      canvas: {
        width: this.width,
        height: this.height,
        background: DEFAULT_CANVAS.background,
      },
      entities: {
        registry: 'default',
        embedded: [],
      },
      nodes: [...this.nodes],
      edges: [...this.edges],
    };

    if (this.sequences.length > 0 || this.nodeEffects.length > 0) {
      diagram.animation = this.buildAnimation();
    }

    return diagram;
  }

  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }

  private buildNode(id: string, input: NodeInput): DiagramNode {
    if (input.type === 'entity') {
      return {
        id,
        type: 'entity',
        entityId: input.entityId,
        label: input.label,
        position: { ...input.position },
        size: input.size ? { ...input.size } : { ...DEFAULT_ENTITY_NODE_SIZE },
        style: { ...input.style },
      };
    }

    return {
      id,
      type: 'shape',
      shape: input.shape,
      label: input.label,
      position: { ...input.position },
      size: input.size ? { ...input.size } : { ...DEFAULT_NODE_SIZE },
      style: { ...input.style },
    };
  }

  private buildAnimation(): AnimationConfig {
    const maxDuration = Math.max(
      ...this.sequences.flatMap((s) =>
        s.steps.map((step) => step.startTime + step.duration),
      ),
      ...this.nodeEffects.map((e) => e.triggerTime + e.duration),
      3000,
    );

    return {
      type: 'flow',
      duration: maxDuration,
      fps: 12,
      loop: true,
      sequences: [...this.sequences],
      nodeEffects: [...this.nodeEffects],
    };
  }
}
