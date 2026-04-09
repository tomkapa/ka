import { describe, it, expect, beforeEach } from 'vitest';
import { EntitySearch } from '../entities/entity-search.js';
import { ManifestLoader } from '../entities/manifest-loader.js';
import type { EntityManifest } from '../types/index.js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const entitiesDir = resolve(__dirname, '../../../../entities');

const testManifest: EntityManifest = {
  version: '1.0',
  entities: [
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'databases',
      tags: ['database', 'sql', 'relational'],
      description: 'PostgreSQL relational database',
      image: 'categories/databases/postgresql.svg',
      format: 'svg',
      animated: false,
    },
    {
      id: 'mysql',
      name: 'MySQL',
      category: 'databases',
      tags: ['database', 'sql', 'relational'],
      description: 'MySQL relational database',
      image: 'categories/databases/mysql.svg',
      format: 'svg',
      animated: false,
    },
    {
      id: 'redis',
      name: 'Redis',
      category: 'databases',
      tags: ['database', 'cache', 'key-value', 'nosql'],
      description: 'Redis in-memory data store',
      image: 'categories/databases/redis.svg',
      format: 'svg',
      animated: false,
    },
    {
      id: 'router',
      name: 'Router',
      category: 'networking',
      tags: ['network', 'routing', 'infrastructure'],
      description: 'Network router device',
      image: 'categories/networking/router.svg',
      format: 'svg',
      animated: false,
    },
    {
      id: 'process',
      name: 'Process',
      category: 'general',
      tags: ['flowchart', 'step', 'action'],
      description: 'Process step in a flowchart',
      image: 'categories/general/process.svg',
      format: 'svg',
      animated: false,
    },
  ],
};

describe('EntitySearch', () => {
  let search: EntitySearch;

  beforeEach(() => {
    search = new EntitySearch(testManifest);
  });

  describe('search', () => {
    it('finds entities by exact name', () => {
      const results = search.search('PostgreSQL');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entity.id).toBe('postgresql');
    });

    it('finds entities by tag keyword', () => {
      const results = search.search('database');
      expect(results.length).toBeGreaterThanOrEqual(3);
      const ids = results.map((r) => r.entity.id);
      expect(ids).toContain('postgresql');
      expect(ids).toContain('mysql');
      expect(ids).toContain('redis');
    });

    it('finds entities with fuzzy matching', () => {
      const results = search.search('postgre');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entity.id).toBe('postgresql');
    });

    it('returns empty array for no matches', () => {
      const results = search.search('zzzznonexistent');
      expect(results).toEqual([]);
    });

    it('respects limit parameter', () => {
      const results = search.search('database', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('returns results with scores', () => {
      const results = search.search('redis');
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result).toHaveProperty('score');
        expect(typeof result.score).toBe('number');
      }
    });
  });

  describe('getById', () => {
    it('returns an entity by ID', () => {
      const entity = search.getById('postgresql');
      expect(entity).toBeDefined();
      expect(entity!.name).toBe('PostgreSQL');
    });

    it('returns undefined for unknown ID', () => {
      const entity = search.getById('nonexistent');
      expect(entity).toBeUndefined();
    });
  });

  describe('getByCategory', () => {
    it('returns all entities in a category', () => {
      const entities = search.getByCategory('databases');
      expect(entities).toHaveLength(3);
      const ids = entities.map((e) => e.id);
      expect(ids).toContain('postgresql');
      expect(ids).toContain('mysql');
      expect(ids).toContain('redis');
    });

    it('returns empty array for unknown category', () => {
      const entities = search.getByCategory('nonexistent');
      expect(entities).toEqual([]);
    });
  });

  describe('listCategories', () => {
    it('returns all unique categories', () => {
      const categories = search.listCategories();
      expect(categories).toContain('databases');
      expect(categories).toContain('networking');
      expect(categories).toContain('general');
      expect(categories).toHaveLength(3);
    });
  });
});

describe('ManifestLoader', () => {
  describe('fromJson', () => {
    it('parses a valid manifest object', () => {
      const manifest = ManifestLoader.fromJson(testManifest);
      expect(manifest.entities).toHaveLength(5);
      expect(manifest.version).toBe('1.0');
    });

    it('throws for invalid manifest (missing version)', () => {
      expect(() => ManifestLoader.fromJson({ entities: [] })).toThrow();
    });

    it('throws for invalid manifest (missing entities)', () => {
      expect(() => ManifestLoader.fromJson({ version: '1.0' })).toThrow();
    });

    it('throws for non-object input', () => {
      expect(() => ManifestLoader.fromJson('not an object')).toThrow();
    });
  });

  describe('fromDirectory', () => {
    it('loads manifest from the entities directory', async () => {
      const manifest = await ManifestLoader.fromDirectory(entitiesDir);
      expect(manifest.version).toBe('1.0');
      expect(manifest.entities.length).toBeGreaterThan(0);
    });

    it('throws for non-existent directory', async () => {
      await expect(
        ManifestLoader.fromDirectory('/nonexistent/path'),
      ).rejects.toThrow();
    });
  });
});
