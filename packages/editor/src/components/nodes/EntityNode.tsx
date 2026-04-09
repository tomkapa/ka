import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EntityNodeData } from '../../hooks/useFlowDiagram.js';

const POSITIONS = [
  { position: Position.Top, id: 'top' },
  { position: Position.Right, id: 'right' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
] as const;

function EntityNodeComponent({ data }: NodeProps) {
  const { label, entityId, width, height } = data as unknown as EntityNodeData;

  return (
    <div
      className="entity-node"
      style={{ width, height, textAlign: 'center' }}
    >
      {POSITIONS.map(({ position, id }) => (
        <Handle key={`src-${id}`} type="source" position={position} id={id} />
      ))}
      {POSITIONS.map(({ position, id }) => (
        <Handle key={`tgt-${id}`} type="target" position={position} id={`${id}-target`} />
      ))}
      <div
        className="entity-node__image"
        style={{
          width: width * 0.7,
          height: height * 0.7,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#666',
        }}
      >
        {entityId}
      </div>
      <div className="entity-node__label">{label}</div>
    </div>
  );
}

export const EntityNode = memo(EntityNodeComponent);
