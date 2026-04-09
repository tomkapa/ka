import { useState, useMemo } from 'react';
import { EntitySearch, type EntityManifest, type EntityDefinition } from '@flowdiagram/core';

export function useEntitySearch(manifest: EntityManifest) {
  const [query, setQuery] = useState('');

  const search = useMemo(() => new EntitySearch(manifest), [manifest]);

  const results: EntityDefinition[] = useMemo(() => {
    if (!query.trim()) {
      return manifest.entities;
    }
    return search.search(query).map((r) => r.entity);
  }, [query, search, manifest.entities]);

  const categories = useMemo(() => search.listCategories(), [search]);

  return { query, setQuery, results, categories };
}
