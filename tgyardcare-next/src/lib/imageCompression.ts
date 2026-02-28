import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

/**
 * Compresses and converts an image to WebP format
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed WebP file
 */
export async function compressToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    ...options
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

/**
 * Converts a base64 image to WebP format
 * @param base64 - Base64 encoded image string
 * @param options - Compression options
 * @returns Compressed WebP blob
 */
export async function base64ToWebP(
  base64: string,
  options: CompressionOptions = {}
): Promise<Blob> {
  // Convert base64 to blob
  const response = await fetch(base64);
  const blob = await response.blob();
  
  // Create File object from blob
  const file = new File([blob], 'image.jpg', { type: blob.type });
  
  // Compress to WebP
  const compressedFile = await compressToWebP(file, options);
  return compressedFile;
}

/**
 * Bulk compress multiple images to WebP
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed WebP files
 */
export async function bulkCompressToWebP(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => compressToWebP(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Get optimal image dimensions based on use case
 */
export const imageDimensions = {
  hero: { maxWidthOrHeight: 1920, maxSizeMB: 1 },
  service: { maxWidthOrHeight: 800, maxSizeMB: 0.5 },
  thumbnail: { maxWidthOrHeight: 400, maxSizeMB: 0.2 },
  beforeAfter: { maxWidthOrHeight: 1200, maxSizeMB: 0.8 },
  gallery: { maxWidthOrHeight: 1000, maxSizeMB: 0.6 },
};
