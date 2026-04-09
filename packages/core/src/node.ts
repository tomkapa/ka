// Node.js-specific exports (filesystem, path, etc.)
// Import from '@flowdiagram/core/node' in Node.js contexts only.
export { ManifestLoader } from './entities/manifest-loader.js';
export { DiagramFileIO } from './io/file-io.js';
export {
  FileNotFoundError,
  ParseError,
  DiagramValidationError,
} from './io/errors.js';
