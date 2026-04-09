import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DiagramFileIO, FileNotFoundError, ParseError, DiagramValidationError } from '../node.js';
import { DiagramValidator } from '../schema/validator.js';
import { DiagramBuilder } from '../builder/diagram-builder.js';
import { writeFile } from 'node:fs/promises';

let tempDir: string;
let fileIO: DiagramFileIO;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'flowdiagram-test-'));
  fileIO = new DiagramFileIO(new DiagramValidator());
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('DiagramFileIO', () => {
  describe('write and read round-trip', () => {
    it('writes and reads back an identical diagram', async () => {
      const builder = new DiagramBuilder({ name: 'Round Trip' });
      const n1 = builder.addNode({
        type: 'shape',
        shape: 'rectangle',
        label: 'A',
        position: { x: 0, y: 0 },
      });
      const n2 = builder.addNode({
        type: 'entity',
        entityId: 'postgresql',
        label: 'DB',
        position: { x: 200, y: 0 },
      });
      builder.addEdge({ source: n1, target: n2, label: 'query' });
      const original = builder.build();

      const filePath = join(tempDir, 'test.flow.json');
      await fileIO.write(filePath, original);
      const loaded = await fileIO.read(filePath);

      expect(loaded).toEqual(original);
    });
  });

  describe('read errors', () => {
    it('throws FileNotFoundError for non-existent file', async () => {
      const filePath = join(tempDir, 'nonexistent.flow.json');
      await expect(fileIO.read(filePath)).rejects.toBeInstanceOf(
        FileNotFoundError,
      );
    });

    it('throws ParseError for invalid JSON', async () => {
      const filePath = join(tempDir, 'bad.flow.json');
      await writeFile(filePath, 'not valid json{{{');
      await expect(fileIO.read(filePath)).rejects.toBeInstanceOf(ParseError);
    });

    it('throws DiagramValidationError for invalid schema', async () => {
      const filePath = join(tempDir, 'invalid.flow.json');
      await writeFile(filePath, JSON.stringify({ version: '1.0' }));
      await expect(fileIO.read(filePath)).rejects.toBeInstanceOf(
        DiagramValidationError,
      );
    });

    it('DiagramValidationError includes the file path', async () => {
      const filePath = join(tempDir, 'invalid.flow.json');
      await writeFile(filePath, JSON.stringify({ version: '1.0' }));
      try {
        await fileIO.read(filePath);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(DiagramValidationError);
        expect((err as DiagramValidationError).filePath).toBe(filePath);
      }
    });
  });

  describe('file extension validation', () => {
    it('throws for files not ending in .flow.json on write', async () => {
      const builder = new DiagramBuilder();
      const diagram = builder.build();
      const filePath = join(tempDir, 'test.json');
      await expect(fileIO.write(filePath, diagram)).rejects.toThrow(
        /\.flow\.json/,
      );
    });

    it('throws for files not ending in .flow.json on read', async () => {
      const filePath = join(tempDir, 'test.json');
      await expect(fileIO.read(filePath)).rejects.toThrow(/\.flow\.json/);
    });
  });
});
