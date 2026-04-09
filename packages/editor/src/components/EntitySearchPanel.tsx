import { useEntitySearch } from '../hooks/useEntitySearch.js';
import type { EntityManifest, EntityDefinition } from '@flowdiagram/core';

interface EntitySearchPanelProps {
  manifest: EntityManifest;
  onSelect?: (entity: EntityDefinition) => void;
}

export function EntitySearchPanel({
  manifest,
  onSelect,
}: EntitySearchPanelProps) {
  const { query, setQuery, results } = useEntitySearch(manifest);

  function handleDragStart(
    event: React.DragEvent,
    entity: EntityDefinition,
  ) {
    event.dataTransfer.setData(
      'application/flowdiagram-entity',
      JSON.stringify(entity),
    );
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div className="entity-search-panel">
      <div className="entity-search-panel__input-wrapper">
        <input
          type="text"
          placeholder="Search entities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="entity-search-panel__input"
        />
      </div>
      <div className="entity-search-panel__results">
        {results.map((entity) => (
          <div
            key={entity.id}
            className="entity-search-panel__item"
            draggable
            onClick={() => onSelect?.(entity)}
            onDragStart={(e) => handleDragStart(e, entity)}
          >
            <div className="entity-search-panel__item-icon">
              {entity.id.slice(0, 2).toUpperCase()}
            </div>
            <div className="entity-search-panel__item-name">
              {entity.name}
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="entity-search-panel__empty">No entities found</div>
        )}
      </div>
    </div>
  );
}
