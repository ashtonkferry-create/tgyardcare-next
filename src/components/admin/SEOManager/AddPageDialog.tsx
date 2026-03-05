'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useCreateSEO, PageSEO } from '@/hooks/useSEOData';
import { toast } from 'sonner';

export function AddPageDialog() {
  const [open, setOpen] = useState(false);
  const createSEO = useCreateSEO();

  const [formData, setFormData] = useState({
    page_name: '',
    page_path: '',
    page_type: 'page' as PageSEO['page_type'],
    seo_title: '',
    meta_description: '',
    primary_keyword: '',
    is_indexable: true,
    schema_type: 'WebPage' as PageSEO['schema_type'],
    priority: 0.5,
    change_frequency: 'monthly' as PageSEO['change_frequency'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.page_name || !formData.page_path) {
      toast.error('Page name and path are required');
      return;
    }

    // Ensure path starts with /
    const path = formData.page_path.startsWith('/') ? formData.page_path : `/${formData.page_path}`;

    try {
      await createSEO.mutateAsync({
        ...formData,
        page_path: path,
        secondary_keywords: null,
        canonical_url: null,
        schema_data: {},
        og_title: null,
        og_description: null,
        og_image: null,
        og_type: 'website',
        twitter_card: 'summary_large_image',
        twitter_title: null,
        twitter_description: null,
        twitter_image: null,
      });

      toast.success('Page added to SEO Manager');
      setOpen(false);
      setFormData({
        page_name: '',
        page_path: '',
        page_type: 'page',
        seo_title: '',
        meta_description: '',
        primary_keyword: '',
        is_indexable: true,
        schema_type: 'WebPage',
        priority: 0.5,
        change_frequency: 'monthly',
      });
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        toast.error('A page with this path already exists');
      } else {
        toast.error('Failed to add page');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Page
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Page to SEO Manager</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page_name">Page Name</Label>
              <Input
                id="page_name"
                value={formData.page_name}
                onChange={(e) => setFormData(prev => ({ ...prev, page_name: e.target.value }))}
                placeholder="e.g. Lawn Care"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page_path">URL Path</Label>
              <Input
                id="page_path"
                value={formData.page_path}
                onChange={(e) => setFormData(prev => ({ ...prev, page_path: e.target.value }))}
                placeholder="e.g. /services/lawn-care"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page_type">Page Type</Label>
              <Select
                value={formData.page_type}
                onValueChange={(value: PageSEO['page_type']) => setFormData(prev => ({ ...prev, page_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schema_type">Schema Type</Label>
              <Select
                value={formData.schema_type}
                onValueChange={(value: PageSEO['schema_type']) => setFormData(prev => ({ ...prev, schema_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WebPage">WebPage</SelectItem>
                  <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="FAQPage">FAQPage</SelectItem>
                  <SelectItem value="Article">Article</SelectItem>
                  <SelectItem value="Organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo_title">SEO Title</Label>
            <Input
              id="seo_title"
              value={formData.seo_title}
              onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
              placeholder="Page Title | TG Yard Care"
            />
            <div className="text-xs text-muted-foreground">{formData.seo_title.length}/60 characters</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              placeholder="Brief description for search results..."
              className="h-20"
            />
            <div className="text-xs text-muted-foreground">{formData.meta_description.length}/160 characters</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_keyword">Primary Keyword</Label>
            <Input
              id="primary_keyword"
              value={formData.primary_keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_keyword: e.target.value }))}
              placeholder="e.g. lawn care madison wi"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSEO.isPending}>
              {createSEO.isPending ? 'Adding...' : 'Add Page'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
