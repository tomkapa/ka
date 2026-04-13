export interface GifExportConfig {
  width: number;
  height: number;
  fps: number;
  duration: number;
  /** gif.js quality: 1 = best quality (slower), 30 = lowest quality (fastest) */
  quality: number;
}

export const DEFAULT_GIF_CONFIG: GifExportConfig = {
  width: 800,
  height: 600,
  fps: 12,
  duration: 3000,
  quality: 10,
};
