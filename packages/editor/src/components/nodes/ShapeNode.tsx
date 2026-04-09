import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ShapeType } from '@flowdiagram/core';
import type { ShapeNodeData } from '../../hooks/useFlowDiagram.js';

const POSITIONS = [
  { position: Position.Top, id: 'top' },
  { position: Position.Right, id: 'right' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
] as const;

function ShapeSvg({
  shape,
  width,
  height,
  fill,
}: {
  shape: ShapeType;
  width: number;
  height: number;
  fill: string;
}) {
  switch (shape) {
    case 'diamond':
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <polygon
            points={`${width / 2},2 ${width - 2},${height / 2} ${width / 2},${height - 2} 2,${height / 2}`}
            fill={fill}
            stroke="#666"
            strokeWidth={1.5}
          />
        </svg>
      );
    case 'circle':
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <circle
            cx={width / 2}
            cy={height / 2}
            r={Math.min(width, height) / 2 - 2}
            fill={fill}
            stroke="#666"
            strokeWidth={1.5}
          />
        </svg>
      );
    case 'ellipse':
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <ellipse
            cx={width / 2}
            cy={height / 2}
            rx={width / 2 - 2}
            ry={height / 2 - 2}
            fill={fill}
            stroke="#666"
            strokeWidth={1.5}
          />
        </svg>
      );
    case 'hexagon': {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) / 2 - 2;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(' ');
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <polygon
            points={pts}
            fill={fill}
            stroke="#666"
            strokeWidth={1.5}
          />
        </svg>
      );
    }
    default: // rectangle
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            rx={4}
            fill={fill}
            stroke="#666"
            strokeWidth={1.5}
          />
        </svg>
      );
  }
}

function ShapeNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as ShapeNodeData;
  const { label, shape, width, height } = nodeData;
  const fill =
    (nodeData.style as Record<string, unknown>)?.fill as string ?? '#E3F2FD';

  return (
    <div className="shape-node" style={{ width, height, position: 'relative' }}>
      {POSITIONS.map(({ position, id }) => (
        <Handle key={`src-${id}`} type="source" position={position} id={id} />
      ))}
      {POSITIONS.map(({ position, id }) => (
        <Handle key={`tgt-${id}`} type="target" position={position} id={`${id}-target`} />
      ))}
      <ShapeSvg shape={shape} width={width} height={height} fill={fill} />
      <div
        className="shape-node__label"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export const ShapeNode = memo(ShapeNodeComponent);
