declare module 'gif.js' {
  interface GIFOptions {
    /** Number of web workers to use (default: 2) */
    workers?: number;
    /** Quality, 1-30, lower is better (default: 10) */
    quality?: number;
    /** Output width in pixels */
    width?: number;
    /** Output height in pixels */
    height?: number;
    /** URL to the gif.worker.js file */
    workerScript?: string;
    /** Whether to repeat the animation (default: 0 = loop forever, -1 = no loop) */
    repeat?: number;
    /** Background color as [r, g, b] */
    background?: [number, number, number];
    /** Whether to use transparency */
    transparent?: number | null;
    /** Debug logging */
    debug?: boolean;
  }

  interface AddFrameOptions {
    /** Frame delay in milliseconds */
    delay?: number;
    /** How to dispose of this frame (default: -1 = automatic) */
    dispose?: number;
    /** Copy the canvas data immediately */
    copy?: boolean;
  }

  class GIF {
    constructor(options?: GIFOptions);
    addFrame(
      image: HTMLCanvasElement | CanvasRenderingContext2D | ImageData,
      options?: AddFrameOptions,
    ): void;
    render(): void;
    abort(): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    running: boolean;
  }

  export = GIF;
}
