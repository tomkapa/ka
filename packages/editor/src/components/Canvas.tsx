import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Node as RFNode,
  type Edge as RFEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes/index.js';
import { edgeTypes } from './edges/index.js';
import { ParticleOverlay } from './animation/ParticleOverlay.js';
import { NodeEffectOverlay } from './animation/NodeEffectOverlay.js';
import { NodeEffectExportOverlay } from './animation/NodeEffectExportOverlay.js';
import type { AnimationFrameState } from '@flowdiagram/core';

interface CanvasProps {
  nodes: RFNode[];
  edges: RFEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  animationState?: AnimationFrameState;
  /** When true, render effects as SVG instead of CSS box-shadow for html2canvas. */
  exportOverlay?: boolean;
}

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  animationState,
  exportOverlay,
}: CanvasProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      defaultEdgeOptions={{ type: 'smoothstep' }}
    >
      <Background />
      <Controls />
      <MiniMap />
      {animationState && animationState.particles.length > 0 && (
        <ParticleOverlay particles={animationState.particles} />
      )}
      {animationState && animationState.nodeEffects.length > 0 &&
        (exportOverlay ? (
          <NodeEffectExportOverlay
            effects={animationState.nodeEffects}
            rfNodes={nodes}
          />
        ) : (
          <NodeEffectOverlay
            effects={animationState.nodeEffects}
            rfNodes={nodes}
          />
        ))}
    </ReactFlow>
  );
}
