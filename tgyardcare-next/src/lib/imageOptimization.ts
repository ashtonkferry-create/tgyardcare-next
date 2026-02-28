import imageCompression from 'browser-image-compression';

export interface OptimizationOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  outputFormat?: 'webp' | 'jpeg' | 'png';
}

export interface OptimizedImage {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: { width: number; height: number };
}

/**
 * Automatically optimizes an image file to the smallest possible size while maintaining quality
 * Converts to WebP format by default for maximum compression
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    maxSizeMB = 0.5, // Target 500KB max
    maxWidthOrHeight = 1920, // Max dimension
    useWebWorker = true,
    quality = 0.85, // 85% quality - good balance
    outputFormat = 'webp' // Default to WebP
  } = options;

  console.log(`Optimizing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

  // Get original dimensions
  const dimensions = await getImageDimensions(file);
  const originalSize = file.size;

  try {
    // Compression options
    const compressionOptions = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      fileType: `image/${outputFormat}`,
      initialQuality: quality,
      alwaysKeepResolution: false,
      onProgress: (progress: number) => {
        console.log(`Compression progress: ${progress}%`);
      }
    };

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);

    // Calculate compression stats
    const optimizedSize = compressedFile.size;
    const compressionRatio = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(`Optimization complete:
      Original: ${(originalSize / 1024).toFixed(2)}KB
      Optimized: ${(optimizedSize / 1024).toFixed(2)}KB
      Saved: ${compressionRatio}%
      Format: ${outputFormat}
    `);

    // Rename file to include format extension
    const newFileName = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
    const renamedFile = new File([compressedFile], newFileName, {
      type: `image/${outputFormat}`,
      lastModified: Date.now()
    });

    return {
      file: renamedFile,
      originalSize,
      optimizedSize,
      compressionRatio: parseFloat(compressionRatio),
      format: outputFormat,
      dimensions
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Batch optimize multiple images
 */
export async function optimizeImages(
  files: File[],
  options: OptimizationOptions = {}
): Promise<OptimizedImage[]> {
  console.log(`Starting batch optimization of ${files.length} images...`);
  
  const results = await Promise.all(
    files.map(file => optimizeImage(file, options))
  );

  const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOptimizedSize = results.reduce((sum, r) => sum + r.optimizedSize, 0);
  const totalSaved = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);

  console.log(`Batch optimization complete:
    Total files: ${files.length}
    Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB
    Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB
    Total saved: ${totalSaved}%
  `);

  return results;
}

/**
 * Get image dimensions without loading the full image
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Create a preview URL for an optimized image
 */
export function createPreviewURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Validate if a file is an image
 */
export function isValidImage(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Get recommended optimization settings based on use case
 */
export function getOptimizationPresets(preset: 'hero' | 'thumbnail' | 'gallery' | 'profile'): OptimizationOptions {
  const presets = {
    hero: {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      quality: 0.9,
      outputFormat: 'webp' as const
    },
    thumbnail: {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 400,
      quality: 0.8,
      outputFormat: 'webp' as const
    },
    gallery: {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      quality: 0.85,
      outputFormat: 'webp' as const
    },
    profile: {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 500,
      quality: 0.85,
      outputFormat: 'webp' as const
    }
  };

  return presets[preset];
}