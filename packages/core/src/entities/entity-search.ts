import Fuse from 'fuse.js';
import type { EntityDefinition, EntityManifest } from '../types/index.js';

export interface EntitySearchResult {
  entity: EntityDefinition;
  score: number;
}

export class EntitySearch {
  private readonly fuse: Fuse<EntityDefinition>;
  private readonly entities: EntityDefinition[];
  private readonly byId: Map<string, EntityDefinition>;
  private readonly byCategory: Map<string, EntityDefinition[]>;

  constructor(manifest: EntityManifest) {
    this.entities = manifest.entities;

    this.byId = new Map(this.entities.map((e) => [e.id, e]));

    this.byCategory = new Map<string, EntityDefinition[]>();
    for (const entity of this.entities) {
      const list = this.byCategory.get(entity.category);
      if (list) {
        list.push(entity);
      } else {
        this.byCategory.set(entity.category, [entity]);
      }
    }

    this.fuse = new Fuse(this.entities, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'tags', weight: 0.3 },
        { name: 'category', weight: 0.2 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }

  search(query: string, limit?: number): EntitySearchResult[] {
    const results = this.fuse.search(query, limit ? { limit } : undefined);
    return results.map((r) => ({
      entity: r.item,
      score: r.score ?? 1,
    }));
  }

  getById(id: string): EntityDefinition | undefined {
    return this.byId.get(id);
  }

  getByCategory(category: string): EntityDefinition[] {
    return this.byCategory.get(category) ?? [];
  }

  listCategories(): string[] {
    return [...this.byCategory.keys()];
  }
}
