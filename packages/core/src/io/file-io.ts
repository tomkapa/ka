import { readFile, writeFile } from 'node:fs/promises';
import type { FlowDiagram } from '../types/index.js';
import type { DiagramValidator } from '../schema/validator.js';
import {
  FileNotFoundError,
  ParseError,
  DiagramValidationError,
} from './errors.js';

export class DiagramFileIO {
  constructor(private readonly validator: DiagramValidator) {}

  async read(filePath: string): Promise<FlowDiagram> {
    this.assertFlowJsonExtension(filePath);

    let raw: string;
    try {
      raw = await readFile(filePath, 'utf-8');
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileNotFoundError(filePath);
      }
      throw err;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new ParseError(filePath, err);
    }

    const result = this.validator.validate(parsed);
    if (!result.valid) {
      throw new DiagramValidationError(filePath, result.errors);
    }

    return result.diagram;
  }

  async write(filePath: string, diagram: FlowDiagram): Promise<void> {
    this.assertFlowJsonExtension(filePath);
    const json = JSON.stringify(diagram, null, 2);
    await writeFile(filePath, json, 'utf-8');
  }

  private assertFlowJsonExtension(filePath: string): void {
    if (!filePath.endsWith('.flow.json')) {
      throw new Error(
        `File path must end with .flow.json, got: ${filePath}`,
      );
    }
  }
}
