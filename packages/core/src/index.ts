// Types
export type {
  DiagramMeta,
  Canvas,
  EntityDefinition,
  EntityManifest,
  EmbeddedEntity,
  EntityConfig,
  Position,
  Size,
  ShapeType,
  BaseNodeStyle,
  EntityNodeStyle,
  ShapeNodeStyle,
  EntityNode,
  ShapeNode,
  DiagramNode,
  EdgeType,
  HandlePosition,
  ArrowHead,
  EdgeStyle,
  DiagramEdge,
  AnimationType,
  NodeEffectType,
  AnimationStep,
  AnimationSequence,
  NodeEffect,
  AnimationConfig,
  FlowDiagram,
} from './types/index.js';

// Guards (browser-safe)
export { isEntityNode, isShapeNode, isFlowDiagram } from './guards.js';

// Schema validation (browser-safe)
export { DiagramValidator } from './schema/index.js';
export type { ValidationResult, ValidationError } from './schema/index.js';

// Entity search (browser-safe: EntitySearch only uses Fuse.js, no Node APIs)
export { EntitySearch } from './entities/entity-search.js';
export type { EntitySearchResult } from './entities/entity-search.js';

// Builder (browser-safe)
export { DiagramBuilder, generateId } from './builder/index.js';
export type { DiagramBuilderOptions } from './builder/index.js';
export type {
  NodeInput,
  EntityNodeInput,
  ShapeNodeInput,
  EdgeInput,
  AnimationSequenceInput,
  NodeEffectInput,
} from './builder/index.js';
export {
  DEFAULT_CANVAS,
  DEFAULT_NODE_SIZE,
  DEFAULT_ENTITY_NODE_SIZE,
  DEFAULT_EDGE_STYLE,
} from './builder/index.js';

// Animation (browser-safe)
export { AnimationTimeline } from './animation/index.js';
export type {
  ParticleState,
  NodeEffectState,
  AnimationFrameState,
} from './animation/index.js';

// Node.js-only exports: import from subpaths directly
// - ManifestLoader: import from '@flowdiagram/core/node'
// - DiagramFileIO: import from '@flowdiagram/core/node'
// - Error classes: import from '@flowdiagram/core/node'
