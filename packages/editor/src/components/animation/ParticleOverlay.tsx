import { useMemo, useRef, useCallback } from 'react';
import { useViewport } from '@xyflow/react';
import type { ParticleState } from '@flowdiagram/core';

interface ParticleOverlayProps {
  particles: ParticleState[];
}

/**
 * Query the actual SVG path elements that ReactFlow renders for edges.
 * ReactFlow renders edges inside `.react-flow__edges` with class `.react-flow__edge`.
 * Each edge group has `data-testid="rf__edge-{edgeId}"` and contains a <path> element.
 */
function getEdgeSvgPath(edgeId: string): SVGPathElement | null {
  const edgeGroup = document.querySelector(
    `.react-flow__edge[data-testid="rf__edge-${edgeId}"]`,
  );
  if (!edgeGroup) return null;
  // The visible path (not the invisible interaction path)
  return edgeGroup.querySelector('path.react-flow__edge-path');
}

export function ParticleOverlay({ particles }: ParticleOverlayProps) {
  const { x: vpX, y: vpY, zoom } = useViewport();
  const pathCache = useRef(new Map<string, SVGPathElement>());

  const getCachedPath = useCallback((edgeId: string): SVGPathElement | null => {
    let path = pathCache.current.get(edgeId);
    if (path && path.isConnected) return path;
    // Cache miss or detached — re-query
    path = getEdgeSvgPath(edgeId) ?? undefined;
    if (path) {
      pathCache.current.set(edgeId, path);
    } else {
      pathCache.current.delete(edgeId);
    }
    return path ?? null;
  }, []);

  const particlePositions = useMemo(() => {
    return particles
      .map((p) => {
        const path = getCachedPath(p.edgeId);
        if (!path) return null;

        const totalLength = path.getTotalLength();
        const point = path.getPointAtLength(p.progress * totalLength);

        return { ...p, x: point.x, y: point.y };
      })
      .filter(Boolean) as Array<ParticleState & { x: number; y: number }>;
  }, [particles, getCachedPath]);

  if (particlePositions.length === 0) return null;

  return (
    <svg
      className="particle-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* Edge paths are already in viewport-transformed coordinates */}
      <g transform={`translate(${vpX}, ${vpY}) scale(${zoom})`}>
        {particlePositions.map((p, i) => (
          <circle
            key={`${p.edgeId}-${i}`}
            cx={p.x}
            cy={p.y}
            r={p.size / zoom}
            fill={p.color}
            opacity={0.9}
          >
            <animate
              attributeName="r"
              values={`${p.size / zoom};${(p.size * 1.3) / zoom};${p.size / zoom}`}
              dur="0.6s"
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    </svg>
  );
}
