'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { removeBackground, Config } from '@imgly/background-removal';

export interface UseBackgroundRemoverOptions {
  /**
   * If true, automatically runs processImage whenever a new initialFile is passed into the hook.
   * Default: false
   */
  autoProcess?: boolean;
  /**
   * Optional custom publicPath or config overrides for the @imgly model assets.
   */
  config?: Partial<Config>;
}

export interface UseBackgroundRemoverReturn {
  /**
   * Triggers client-side background removal on the given File or the initialFile.
   * Returns the transparent PNG Blob or null on failure.
   */
  processImage: (file?: File) => Promise<Blob | null>;
  /**
   * Whether the in-browser WASM model is actively downloading or segmenting the image.
   */
  isProcessing: boolean;
  /**
   * Progress percentage from 0 to 100 during WASM download and inference.
   */
  progress: number;
  /**
   * Current segmentation phase reported by the pipeline (e.g. 'fetch:model', 'compute:inference').
   */
  progressKey: string | null;
  /**
   * The resulting transparent PNG Blob, or null if not yet processed.
   */
  cleanBlob: Blob | null;
  /**
   * Object URL representing the cleanBlob for direct rendering in an <img> tag.
   * Automatically revoked on re-run or unmount.
   */
  cleanUrl: string | null;
  /**
   * Error object if segmentation or WASM initialization failed.
   */
  error: Error | null;
  /**
   * Helper that converts the cleanBlob into a ready-to-upload File with proper filename and mime type.
   */
  getCleanFile: (customFilename?: string) => File | null;
  /**
   * Resets all state and cleans up generated blob URLs.
   */
  reset: () => void;
}

/**
 * Custom React hook for client-side background removal using @imgly/background-removal.
 * Strips image backgrounds directly in the browser via WebAssembly for $0 cost.
 *
 * @param initialFile - Optional raw File (JPG/PNG/WebP) chosen by the user.
 * @param options - Configuration options (autoProcess, asset publicPath overrides).
 */
export function useBackgroundRemover(
  initialFile?: File | null,
  options?: UseBackgroundRemoverOptions
): UseBackgroundRemoverReturn {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressKey, setProgressKey] = useState<string | null>(null);
  const [cleanBlob, setCleanBlob] = useState<Blob | null>(null);
  const [cleanUrl, setCleanUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Keep a reference to the active File
  const currentFileRef = useRef<File | null>(initialFile || null);
  const cleanUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Sync currentFileRef when initialFile changes
  useEffect(() => {
    currentFileRef.current = initialFile || null;
  }, [initialFile]);

  // Keep cleanUrlRef in sync
  useEffect(() => {
    cleanUrlRef.current = cleanUrl;
  }, [cleanUrl]);

  // Revoke object URL helper
  const revokeCleanUrl = useCallback(() => {
    if (cleanUrlRef.current) {
      URL.revokeObjectURL(cleanUrlRef.current);
      cleanUrlRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      revokeCleanUrl();
    };
  }, [revokeCleanUrl]);

  /**
   * Resets the hook state and revokes any allocated Blob URLs.
   */
  const reset = useCallback(() => {
    revokeCleanUrl();
    setIsProcessing(false);
    setProgress(0);
    setProgressKey(null);
    setCleanBlob(null);
    setCleanUrl(null);
    setError(null);
  }, [revokeCleanUrl]);

  /**
   * Converts the processed cleanBlob to a standard File object.
   */
  const getCleanFile = useCallback(
    (customFilename?: string): File | null => {
      if (!cleanBlob) return null;

      let filename = customFilename;
      if (!filename) {
        const sourceName = currentFileRef.current?.name || 'crest';
        const baseName = sourceName.replace(/\.[^/.]+$/, '');
        filename = `${baseName}_clean.png`;
      } else if (!filename.toLowerCase().endsWith('.png')) {
        filename = `${filename}.png`;
      }

      return new File([cleanBlob], filename, {
        type: 'image/png',
        lastModified: Date.now(),
      });
    },
    [cleanBlob]
  );

  /**
   * Executes removeBackground from @imgly/background-removal.
   */
  const processImage = useCallback(
    async (file?: File): Promise<Blob | null> => {
      const targetFile = file || currentFileRef.current;

      if (!targetFile) {
        const noFileErr = new Error('No image file provided for background removal.');
        setError(noFileErr);
        return null;
      }

      // Update current file reference
      currentFileRef.current = targetFile;

      // Reset previous error and clean results
      revokeCleanUrl();
      setIsProcessing(true);
      setProgress(0);
      setProgressKey('init');
      setError(null);
      setCleanBlob(null);
      setCleanUrl(null);

      try {
        const config: Config = {
          output: {
            format: 'image/png',
            quality: 0.95,
          },
          progress: (key: string, current: number, total: number) => {
            if (!isMountedRef.current) return;
            setProgressKey(key);
            if (typeof total === 'number' && total > 0) {
              const pct = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
              setProgress(pct);
            }
          },
          ...options?.config,
        };

        const resultBlob = await removeBackground(targetFile, config);

        if (!isMountedRef.current) return null;

        const newUrl = URL.createObjectURL(resultBlob);
        setCleanBlob(resultBlob);
        setCleanUrl(newUrl);
        setProgress(100);
        setProgressKey('complete');
        setIsProcessing(false);

        return resultBlob;
      } catch (err: unknown) {
        if (!isMountedRef.current) return null;

        const caughtError =
          err instanceof Error
            ? err
            : new Error(
                typeof err === 'string'
                  ? err
                  : 'Failed to strip image background using WebAssembly model.'
              );

        console.error('[@imgly/background-removal] Processing error:', caughtError);
        setError(caughtError);
        setIsProcessing(false);
        setProgress(0);
        setProgressKey(null);
        return null;
      }
    },
    [options?.config, revokeCleanUrl]
  );

  // Auto-process trigger if option enabled
  useEffect(() => {
    if (options?.autoProcess && initialFile) {
      void processImage(initialFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile, options?.autoProcess]);

  return {
    processImage,
    isProcessing,
    progress,
    progressKey,
    cleanBlob,
    cleanUrl,
    error,
    getCleanFile,
    reset,
  };
}
