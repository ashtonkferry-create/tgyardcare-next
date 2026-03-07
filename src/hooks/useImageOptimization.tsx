import { useState, useCallback } from 'react';
import { optimizeImage, optimizeImages, OptimizationOptions, OptimizedImage } from '@/lib/imageOptimization';
import { toast } from 'sonner';

interface UseImageOptimizationReturn {
  optimize: (file: File, options?: OptimizationOptions) => Promise<OptimizedImage | null>;
  optimizeBatch: (files: File[], options?: OptimizationOptions) => Promise<OptimizedImage[]>;
  isOptimizing: boolean;
  progress: number;
  error: string | null;
}

export function useImageOptimization(): UseImageOptimizationReturn {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const optimize = useCallback(async (
    file: File,
    options?: OptimizationOptions
  ): Promise<OptimizedImage | null> => {
    setIsOptimizing(true);
    setError(null);
    setProgress(0);

    try {
      toast.info('Optimizing image...', { id: 'image-optimization' });
      
      const result = await optimizeImage(file, options);
      
      setProgress(100);
      
      toast.success(
        `Image optimized! Reduced by ${result.compressionRatio}% (${(result.originalSize / 1024).toFixed(0)}KB → ${(result.optimizedSize / 1024).toFixed(0)}KB)`,
        { id: 'image-optimization', duration: 5000 }
      );
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize image';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'image-optimization' });
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const optimizeBatch = useCallback(async (
    files: File[],
    options?: OptimizationOptions
  ): Promise<OptimizedImage[]> => {
    setIsOptimizing(true);
    setError(null);
    setProgress(0);

    try {
      toast.info(`Optimizing ${files.length} images...`, { id: 'batch-optimization' });
      
      const results = await optimizeImages(files, options);
      
      const totalSaved = results.reduce((sum, r) => sum + (r.originalSize - r.optimizedSize), 0);
      const avgCompression = results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length;
      
      setProgress(100);
      
      toast.success(
        `${files.length} images optimized! Average compression: ${avgCompression.toFixed(1)}% (Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB)`,
        { id: 'batch-optimization', duration: 5000 }
      );
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize images';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'batch-optimization' });
      return [];
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  return {
    optimize,
    optimizeBatch,
    isOptimizing,
    progress,
    error
  };
}