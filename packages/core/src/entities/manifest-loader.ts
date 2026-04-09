import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { EntityManifest } from '../types/index.js';

export class ManifestLoader {
  static fromJson(data: unknown): EntityManifest {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error(
        'Invalid manifest: expected an object, got ' + typeof data,
      );
    }

    const obj = data as Record<string, unknown>;

    if (typeof obj.version !== 'string') {
      throw new Error('Invalid manifest: missing or invalid "version" field');
    }

    if (!Array.isArray(obj.entities)) {
      throw new Error('Invalid manifest: missing or invalid "entities" array');
    }

    return data as EntityManifest;
  }

  static async fromDirectory(dir: string): Promise<EntityManifest> {
    const manifestPath = resolve(dir, 'manifest.json');
    let raw: string;

    try {
      raw = await readFile(manifestPath, 'utf-8');
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        throw new Error(`Manifest file not found: ${manifestPath}`);
      }
      throw new Error(
        `Failed to read manifest file: ${manifestPath}: ${(err as Error).message}`,
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`Invalid JSON in manifest file: ${manifestPath}`);
    }

    return ManifestLoader.fromJson(parsed);
  }
}
