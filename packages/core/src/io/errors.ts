import type { ValidationError } from '../schema/validator.js';

export class FileNotFoundError extends Error {
  constructor(public readonly filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

export class ParseError extends Error {
  constructor(
    public readonly filePath: string,
    cause?: unknown,
  ) {
    super(`Failed to parse JSON in: ${filePath}`);
    this.name = 'ParseError';
    this.cause = cause;
  }
}

export class DiagramValidationError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly validationErrors: ValidationError[],
  ) {
    const details = validationErrors
      .map((e) => `  ${e.path}: ${e.message}`)
      .join('\n');
    super(`Invalid diagram file: ${filePath}\n${details}`);
    this.name = 'DiagramValidationError';
  }
}
