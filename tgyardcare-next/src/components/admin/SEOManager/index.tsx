'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Download, FileJson } from 'lucide-react';
import { useAllSEOData } from '@/hooks/useSEOData';
import { SEOTable } from './SEOTable';
import { SEOStats } from './SEOStats';
import { AddPageDialog } from './AddPageDialog';
import { Skeleton } from '@/components/ui/skeleton';

export function SEOManager() {
  const { data, isLoading, error, refetch } = useAllSEOData();
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const exportToCSV = () => {
    if (!data) return;

    const headers = ['Page Name', 'Path', 'Type', 'Indexable', 'SEO Title', 'Meta Description', 'Primary Keyword', 'Schema', 'Priority'];
    const rows = data.map(page => [
      page.page_name,
      page.page_path,
      page.page_type,
      page.is_indexable ? 'Yes' : 'No',
      page.seo_title || '',
      page.meta_description || '',
      page.primary_keyword || '',
      page.schema_type,
      page.priority
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportSitemap = () => {
    if (!data) return;

    const indexablePages = data.filter(p => p.is_indexable);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexablePages.map(page => `  <url>
    <loc>https://tgyardcare.com${page.page_path}</loc>
    <lastmod>${page.updated_at.split('T')[0]}</lastmod>
    <changefreq>${page.change_frequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-destructive mb-2">Failed to load SEO data</div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <SEOStats data={data || []} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages, URLs, titles..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="page">Pages</SelectItem>
              <SelectItem value="service">Services</SelectItem>
              <SelectItem value="location">Locations</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button variant="outline" size="sm" onClick={exportSitemap}>
            <FileJson className="h-4 w-4 mr-2" />
            Export Sitemap
          </Button>

          <AddPageDialog />
        </div>
      </div>

      {/* Main Table */}
      <SEOTable
        data={data || []}
        filter={searchFilter}
        typeFilter={typeFilter}
      />

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-muted-foreground text-center">
        Click expand arrow to edit OG tags, canonical URLs, and more • Changes auto-tracked, click Save to persist
      </div>
    </div>
  );
}

export default SEOManager;
