import { useCallback, useRef, useState } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { Canvas } from './components/Canvas.js';
import { EntitySearchPanel } from './components/EntitySearchPanel.js';
import { AnimationControls } from './components/AnimationControls.js';
import { AnimationPanel } from './components/panels/AnimationPanel.js';
import { NodeEffectsPanel } from './components/panels/NodeEffectsPanel.js';
import { PropertiesPanel } from './components/panels/PropertiesPanel.js';
import { GifExportProgress } from './components/GifExportProgress.js';
import { useFlowDiagram } from './hooks/useFlowDiagram.js';
import { useAnimation } from './hooks/useAnimation.js';
import { useGifExport } from './hooks/useGifExport.js';
import { downloadBlob } from './utils/downloadBlob.js';
import {
  DiagramBuilder,
  DiagramValidator,
  type EntityDefinition,
  type EntityManifest,
  type FlowDiagram,
} from '@flowdiagram/core';
import manifestJson from '../../../entities/manifest.json';
import './styles/editor.css';

const defaultManifest: EntityManifest = manifestJson as EntityManifest;

const validator = new DiagramValidator();

function createDemoDiagram() {
  const builder = new DiagramBuilder({
    name: 'Demo Diagram',
    width: 1200,
    height: 800,
  });

  const user = builder.addNode({
    id: 'user',
    type: 'entity',
    entityId: 'user',
    label: 'User',
    position: { x: 50, y: 200 },
  });

  const api = builder.addNode({
    id: 'api',
    type: 'shape',
    shape: 'rectangle',
    label: 'API Gateway',
    position: { x: 250, y: 200 },
    size: { width: 140, height: 60 },
    style: { fill: '#E8EAF6' },
  });

  const db = builder.addNode({
    id: 'db',
    type: 'entity',
    entityId: 'postgresql',
    label: 'Database',
    position: { x: 500, y: 200 },
  });

  const e1 = builder.addEdge({
    source: user,
    target: api,
    label: 'HTTP',
    style: { animated: true },
  });

  const e2 = builder.addEdge({
    source: api,
    target: db,
    label: 'SQL',
    style: { animated: true },
  });

  builder.addAnimationSequence({
    name: 'Request Flow',
    steps: [
      {
        edgeId: e1,
        particleColor: '#2196F3',
        particleSize: 6,
        speed: 1.0,
        startTime: 0,
        duration: 1500,
      },
      {
        edgeId: e2,
        particleColor: '#4CAF50',
        particleSize: 6,
        speed: 1.0,
        startTime: 1500,
        duration: 1500,
      },
    ],
  });

  builder.addNodeEffect({
    nodeId: api,
    effect: 'pulse',
    triggerTime: 1200,
    duration: 600,
    color: '#2196F3',
  });

  builder.addNodeEffect({
    nodeId: db,
    effect: 'glow',
    triggerTime: 2500,
    duration: 500,
    color: '#4CAF50',
  });

  return builder.build();
}

const demoDiagram = createDemoDiagram();

type RightTab = 'animation' | 'effects' | 'properties';

function addEntityNode(
  diagram: FlowDiagram,
  entity: EntityDefinition,
  position: { x: number; y: number },
): FlowDiagram {
  const builder = new DiagramBuilder();
  builder.addNode({
    type: 'entity',
    entityId: entity.id,
    label: entity.name,
    position,
  });
  const newNode = builder.build().nodes[0];
  return {
    ...diagram,
    nodes: [...diagram.nodes, newNode],
  };
}

function EditorContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rightTab, setRightTab] = useState<RightTab>('animation');
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    diagram,
    loadDiagram,
    saveDiagram,
  } = useFlowDiagram(demoDiagram);

  const {
    isPlaying,
    currentTime,
    frameState,
    duration,
    play,
    pause,
    reset,
    seekTo,
  } = useAnimation(diagram);

  const { isExporting, exportProgress, exportGif } = useGifExport(
    diagram,
    reactFlowWrapper,
    seekTo,
    duration,
  );

  const handleExportGif = useCallback(() => {
    exportGif().catch((err: Error) => alert(`GIF export failed: ${err.message}`));
  }, [exportGif]);

  const handleNew = useCallback(() => {
    loadDiagram(new DiagramBuilder({ name: 'Untitled' }).build());
  }, [loadDiagram]);

  const handleSave = useCallback(() => {
    const d = saveDiagram();
    if (!d) return;
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${d.meta.name || 'diagram'}.flow.json`);
  }, [saveDiagram]);

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.flow.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        const result = validator.validate(parsed);
        if (!result.valid) {
          const msgs = result.errors.map((e) => `${e.path}: ${e.message}`);
          alert(`Invalid diagram file:\n${msgs.join('\n')}`);
          return;
        }
        loadDiagram(result.diagram);
      } catch (err) {
        alert(`Failed to load diagram: ${(err as Error).message}`);
      }
    };
    input.click();
  }, [loadDiagram]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer.getData(
        'application/flowdiagram-entity',
      );
      if (!data || !diagram) return;

      const entity: EntityDefinition = JSON.parse(data);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      loadDiagram(addEntityNode(diagram, entity, position));
    },
    [diagram, loadDiagram, screenToFlowPosition],
  );

  const handleEntitySelect = useCallback(
    (entity: EntityDefinition) => {
      if (!diagram) return;
      const position = {
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 300,
      };
      loadDiagram(addEntityNode(diagram, entity, position));
    },
    [diagram, loadDiagram],
  );

  return (
    <>
    {isExporting && <GifExportProgress progress={exportProgress} />}
    <div className="app-layout">
      <div className="app-sidebar">
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #e0e0e0' }}>
          <strong style={{ fontSize: 13 }}>Entities</strong>
        </div>
        <EntitySearchPanel
          manifest={defaultManifest}
          onSelect={handleEntitySelect}
        />
      </div>
      <div className="app-main">
        <div className="app-toolbar">
          <span className="app-toolbar__title">
            {diagram?.meta.name ?? 'FlowDiagram'}
          </span>
          <button onClick={handleNew}>New</button>
          <button onClick={handleOpen}>Open</button>
          <button onClick={handleSave}>Save</button>
          <button
            onClick={handleExportGif}
            disabled={isExporting || !diagram?.animation}
            title="Export animation as GIF"
          >
            Export GIF
          </button>
          <div style={{ marginLeft: 8, borderLeft: '1px solid #e0e0e0', paddingLeft: 8 }}>
            <AnimationControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlay={play}
              onPause={pause}
              onReset={reset}
              onSeek={seekTo}
            />
          </div>
        </div>
        <div className="app-canvas" ref={reactFlowWrapper}>
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            animationState={frameState}
          />
        </div>
      </div>
      <div className="app-right-sidebar">
        <div className="app-right-sidebar__tabs">
          {(['animation', 'effects', 'properties'] as const).map((tab) => (
            <button
              key={tab}
              className={`app-right-sidebar__tab ${rightTab === tab ? 'app-right-sidebar__tab--active' : ''}`}
              onClick={() => setRightTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        {rightTab === 'animation' && (
          <AnimationPanel diagram={diagram} onDiagramChange={loadDiagram} />
        )}
        {rightTab === 'effects' && (
          <NodeEffectsPanel diagram={diagram} onDiagramChange={loadDiagram} />
        )}
        {rightTab === 'properties' && (
          <PropertiesPanel diagram={diagram} onDiagramChange={loadDiagram} />
        )}
      </div>
    </div>
    </>
  );
}

export function App() {
  return (
    <ReactFlowProvider>
      <EditorContent />
    </ReactFlowProvider>
  );
}
