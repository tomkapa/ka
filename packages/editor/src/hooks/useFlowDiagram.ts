import { useCallback, useState } from 'react';
import {
  type Node as RFNode,
  type Edge as RFEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  FlowDiagram,
  DiagramNode,
  DiagramEdge,
  EntityNode,
  ShapeNode,
  ShapeType,
} from '@flowdiagram/core';

export interface ShapeNodeData {
  label: string;
  shape: ShapeType;
  style: Record<string, unknown>;
  width: number;
  height: number;
  [key: string]: unknown;
}

export interface EntityNodeData {
  label: string;
  entityId: string;
  style: Record<string, unknown>;
  width: number;
  height: number;
  [key: string]: unknown;
}

export function diagramToReactFlow(diagram: FlowDiagram): {
  nodes: RFNode[];
  edges: RFEdge[];
} {
  const nodes: RFNode[] = diagram.nodes.map((node) => {
    if (node.type === 'entity') {
      const data: EntityNodeData = {
        label: node.label,
        entityId: node.entityId,
        style: { ...node.style },
        width: node.size.width,
        height: node.size.height,
      };
      return {
        id: node.id,
        type: 'entity',
        position: { ...node.position },
        data,
        width: node.size.width,
        height: node.size.height,
      };
    }

    const data: ShapeNodeData = {
      label: node.label,
      shape: node.shape,
      style: { ...node.style },
      width: node.size.width,
      height: node.size.height,
    };
    return {
      id: node.id,
      type: 'shape',
      position: { ...node.position },
      data,
      width: node.size.width,
      height: node.size.height,
    };
  });

  const edges: RFEdge[] = diagram.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null,
    label: edge.label,
    type: edge.style.type ?? 'smoothstep',
    animated: edge.style.animated ?? false,
    style: {
      stroke: edge.style.stroke,
      strokeWidth: edge.style.strokeWidth,
    },
  }));

  return { nodes, edges };
}

export function reactFlowToDiagram(
  rfNodes: RFNode[],
  rfEdges: RFEdge[],
  baseDiagram: FlowDiagram,
): FlowDiagram {
  const nodes: DiagramNode[] = rfNodes.map((rfNode) => {
    if (rfNode.type === 'entity') {
      const data = rfNode.data as EntityNodeData;
      const node: EntityNode = {
        id: rfNode.id,
        type: 'entity',
        entityId: data.entityId,
        label: data.label,
        position: { x: rfNode.position.x, y: rfNode.position.y },
        size: {
          width: data.width ?? rfNode.width ?? 80,
          height: data.height ?? rfNode.height ?? 80,
        },
        style: (data.style ?? {}) as EntityNode['style'],
      };
      return node;
    }

    const data = rfNode.data as ShapeNodeData;
    const node: ShapeNode = {
      id: rfNode.id,
      type: 'shape',
      shape: (data.shape ?? 'rectangle') as ShapeNode['shape'],
      label: data.label,
      position: { x: rfNode.position.x, y: rfNode.position.y },
      size: {
        width: data.width ?? rfNode.width ?? 120,
        height: data.height ?? rfNode.height ?? 60,
      },
      style: (data.style ?? {}) as ShapeNode['style'],
    };
    return node;
  });

  const edges: DiagramEdge[] = rfEdges.map((rfEdge) => ({
    id: rfEdge.id,
    source: rfEdge.source,
    target: rfEdge.target,
    sourceHandle: (rfEdge.sourceHandle as DiagramEdge['sourceHandle']) ?? undefined,
    targetHandle: (rfEdge.targetHandle as DiagramEdge['targetHandle']) ?? undefined,
    label: typeof rfEdge.label === 'string' ? rfEdge.label : undefined,
    style: {
      stroke: (rfEdge.style as Record<string, unknown>)?.stroke as string | undefined,
      strokeWidth: (rfEdge.style as Record<string, unknown>)?.strokeWidth as number | undefined,
      type: (rfEdge.type ?? 'smoothstep') as DiagramEdge['style']['type'],
      animated: rfEdge.animated ?? false,
    },
  }));

  return {
    ...baseDiagram,
    nodes,
    edges,
  };
}

export function useFlowDiagram(initialDiagram?: FlowDiagram) {
  const [diagram, setDiagram] = useState<FlowDiagram | null>(
    initialDiagram ?? null,
  );

  const [nodes, setNodes] = useState<RFNode[]>(() =>
    initialDiagram ? diagramToReactFlow(initialDiagram).nodes : [],
  );
  const [edges, setEdges] = useState<RFEdge[]>(() =>
    initialDiagram ? diagramToReactFlow(initialDiagram).edges : [],
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, type: 'smoothstep' }, eds)),
    [],
  );

  const loadDiagram = useCallback((d: FlowDiagram) => {
    setDiagram(d);
    const { nodes: n, edges: e } = diagramToReactFlow(d);
    setNodes(n);
    setEdges(e);
  }, []);

  const saveDiagram = useCallback((): FlowDiagram | null => {
    if (!diagram) return null;
    return reactFlowToDiagram(nodes, edges, diagram);
  }, [diagram, nodes, edges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    diagram,
    loadDiagram,
    saveDiagram,
  };
}
