import { useViewport, type Node as RFNode } from '@xyflow/react';
import type { NodeEffectState } from '@flowdiagram/core';
import { useEffectGeometry } from './resolveEffectGeometry.js';

interface NodeEffectExportOverlayProps {
  effects: NodeEffectState[];
  rfNodes: RFNode[];
}

/**
 * SVG-based node effect overlay used during GIF export.
 *
 * The regular NodeEffectOverlay uses CSS box-shadow which html2canvas cannot
 * capture reliably. This component renders the same effects as SVG elements
 * using the same viewport transform as ParticleOverlay, so html2canvas picks
 * them up.
 */
export function NodeEffectExportOverlay({
  effects,
  rfNodes,
}: NodeEffectExportOverlayProps) {
  const { x: vpX, y: vpY, zoom } = useViewport();
  const rendered = useEffectGeometry(effects, rfNodes);

  if (rendered.length === 0) return null;

  return (
    <svg
      className="node-effect-export-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <g transform={`translate(${vpX}, ${vpY}) scale(${zoom})`}>
        {rendered.map(({ effect, x, y, width, height }) => (
          <EffectShape
            key={effect.nodeId}
            x={x}
            y={y}
            width={width}
            height={height}
            effect={effect}
          />
        ))}
      </g>
    </svg>
  );
}

const GLOW_LAYERS = [
  { offset: 8, strokeWidth: 8, opacity: 0.15 },
  { offset: 4, strokeWidth: 5, opacity: 0.3 },
  { offset: 1, strokeWidth: 2, opacity: 0.5 },
] as const;

function EffectShape({
  x,
  y,
  width,
  height,
  effect,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  effect: NodeEffectState;
}) {
  const r = 8;
  const { intensity, color } = effect;

  switch (effect.effect) {
    case 'pulse': {
      const scale = 1 + 0.05 * intensity;
      const cx = x + width / 2;
      const cy = y + height / 2;
      return (
        <g
          transform={`translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`}
        >
          <GlowRings x={x} y={y} w={width} h={height} r={r} color={color} intensity={intensity} />
        </g>
      );
    }
    case 'glow':
      return (
        <GlowRings x={x} y={y} w={width} h={height} r={r} color={color} intensity={intensity} />
      );
    case 'highlight':
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={r}
          fill={color}
          opacity={intensity * 0.3}
        />
      );
  }
}

function GlowRings({
  x, y, w, h, r, color, intensity,
}: {
  x: number; y: number; w: number; h: number;
  r: number; color: string; intensity: number;
}) {
  return (
    <>
      {GLOW_LAYERS.map((layer, i) => (
        <rect
          key={i}
          x={x - layer.offset}
          y={y - layer.offset}
          width={w + 2 * layer.offset}
          height={h + 2 * layer.offset}
          rx={r + layer.offset}
          fill="none"
          stroke={color}
          strokeWidth={layer.strokeWidth}
          opacity={intensity * layer.opacity}
        />
      ))}
    </>
  );
}
