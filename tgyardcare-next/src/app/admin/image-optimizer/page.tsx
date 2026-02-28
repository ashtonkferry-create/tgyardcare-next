'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadOptimizer } from "@/components/ImageUploadOptimizer";
import { ArrowLeft, Download, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ImageOptimizer() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleUploadToStorage = async (files: File[]) => {
    try {
      toast.info('Uploading images to storage...');

      const uploads = await Promise.all(
        files.map(async (file) => {
          const filePath = `optimized/${Date.now()}-${file.name}`;

          const { error } = await supabase.storage
            .from('service-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          return filePath;
        })
      );

      toast.success(`Successfully uploaded ${uploads.length} optimized images!`);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    }
  };

  const handleDownloadOptimized = (files: File[]) => {
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    toast.success(`Downloaded ${files.length} optimized images!`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Image Optimizer</h1>
              <p className="text-muted-foreground">
                Automatically compress images to WebP format with optimal quality
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">WebP Format</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">85% Quality</p>
              <p className="text-xs text-muted-foreground">
                Perfect balance of quality and file size
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Max Dimensions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">1920px</p>
              <p className="text-xs text-muted-foreground">
                Optimized for all screen sizes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Target Size</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">~500KB</p>
              <p className="text-xs text-muted-foreground">
                Fast loading without quality loss
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero">Hero Images</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="thumbnail">Thumbnails</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Image Optimization</CardTitle>
                <CardDescription>
                  Large hero images (max 1920px, ~1MB, 90% quality)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadOptimizer
                  preset="hero"
                  multiple={true}
                  maxFiles={10}
                  onOptimized={setUploadedFiles}
                  onUpload={handleUploadToStorage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gallery Image Optimization</CardTitle>
                <CardDescription>
                  Standard gallery images (max 1200px, ~500KB, 85% quality)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadOptimizer
                  preset="gallery"
                  multiple={true}
                  maxFiles={20}
                  onOptimized={setUploadedFiles}
                  onUpload={handleUploadToStorage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thumbnail" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail Optimization</CardTitle>
                <CardDescription>
                  Small thumbnails (max 400px, ~100KB, 80% quality)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadOptimizer
                  preset="thumbnail"
                  multiple={true}
                  maxFiles={30}
                  onOptimized={setUploadedFiles}
                  onUpload={handleUploadToStorage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Image Optimization</CardTitle>
                <CardDescription>
                  Profile avatars (max 500px, ~200KB, 85% quality)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadOptimizer
                  preset="profile"
                  multiple={false}
                  onOptimized={setUploadedFiles}
                  onUpload={handleUploadToStorage}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              variant="outline"
              disabled={uploadedFiles.length === 0}
              onClick={() => handleDownloadOptimized(uploadedFiles)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Optimized ({uploadedFiles.length})
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
