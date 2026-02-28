'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { getOptimizationPresets, isValidImage, createPreviewURL, revokePreviewURL } from '@/lib/imageOptimization';
import { Progress } from '@/components/ui/progress';

interface ImageUploadOptimizerProps {
  onOptimized?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  preset?: 'hero' | 'thumbnail' | 'gallery' | 'profile';
  multiple?: boolean;
  maxFiles?: number;
}

export function ImageUploadOptimizer({
  onOptimized,
  onUpload,
  preset = 'gallery',
  multiple = false,
  maxFiles = 10
}: ImageUploadOptimizerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [optimizedFiles, setOptimizedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const { optimize, optimizeBatch, isOptimizing, progress } = useImageOptimization();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate files
    const validFiles = files.filter(file => {
      if (!isValidImage(file)) {
        console.warn(`Skipping invalid file: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    // Limit number of files
    const filesToProcess = validFiles.slice(0, maxFiles);
    setSelectedFiles(filesToProcess);

    // Auto-optimize
    const optimizationOptions = getOptimizationPresets(preset);

    let results;
    if (filesToProcess.length === 1) {
      const result = await optimize(filesToProcess[0], optimizationOptions);
      results = result ? [result] : [];
    } else {
      const batchResults = await optimizeBatch(filesToProcess, optimizationOptions);
      results = batchResults;
    }

    const optimizedFilesList = results.map(r => r.file);
    setOptimizedFiles(optimizedFilesList);

    // Create previews
    const newPreviews = optimizedFilesList.map(file => createPreviewURL(file));
    setPreviews(newPreviews);

    // Callback
    if (onOptimized) {
      onOptimized(optimizedFilesList);
    }
  };

  const handleUpload = async () => {
    if (onUpload && optimizedFiles.length > 0) {
      await onUpload(optimizedFiles);
      handleClear();
    }
  };

  const handleClear = () => {
    // Revoke preview URLs
    previews.forEach(url => revokePreviewURL(url));

    setSelectedFiles([]);
    setOptimizedFiles([]);
    setPreviews([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    revokePreviewURL(previews[index]);

    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setOptimizedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload & Optimize Images</CardTitle>
        <CardDescription>
          Images are automatically compressed to WebP format for maximum quality and minimal file size
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Click to upload images</p>
          <p className="text-sm text-muted-foreground mb-4">
            {multiple ? `Upload up to ${maxFiles} images` : 'Upload one image'} (JPG, PNG, WebP)
          </p>
          <Button variant="outline" type="button">
            <ImageIcon className="mr-2 h-4 w-4" />
            Select Images
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Optimization Progress */}
        {isOptimizing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Optimizing images...</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Preview Grid */}
        {previews.length > 0 && !isOptimizing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                  >
                    <X className="h-8 w-8 text-white" />
                  </button>
                  <div className="mt-2 text-xs text-center">
                    <p className="font-medium truncate">{optimizedFiles[index].name}</p>
                    <p className="text-muted-foreground">
                      {(optimizedFiles[index].size / 1024).toFixed(0)}KB
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClear}>
                Clear All
              </Button>
              {onUpload && (
                <Button onClick={handleUpload}>
                  Upload {optimizedFiles.length} {optimizedFiles.length === 1 ? 'Image' : 'Images'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
