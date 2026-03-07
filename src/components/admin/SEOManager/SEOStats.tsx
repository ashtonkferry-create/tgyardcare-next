'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageSEO, validateSEOTitle, validateMetaDescription } from '@/hooks/useSEOData';
import { FileText, AlertTriangle, CheckCircle2, Ban, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SEOStatsProps {
  data: PageSEO[];
}

export function SEOStats({ data }: SEOStatsProps) {
  const stats = useMemo(() => {
    let totalPages = data.length;
    let indexablePages = 0;
    let noindexPages = 0;
    let validTitles = 0;
    let validDescriptions = 0;
    let missingTitles = 0;
    let missingDescriptions = 0;
    let duplicateTitles: Map<string, number> = new Map();

    data.forEach(page => {
      if (page.is_indexable) {
        indexablePages++;
      } else {
        noindexPages++;
      }

      const titleValidation = validateSEOTitle(page.seo_title);
      const descValidation = validateMetaDescription(page.meta_description);

      if (titleValidation.valid) validTitles++;
      if (!page.seo_title) missingTitles++;

      if (descValidation.valid) validDescriptions++;
      if (!page.meta_description) missingDescriptions++;

      // Track duplicates
      if (page.seo_title) {
        duplicateTitles.set(page.seo_title, (duplicateTitles.get(page.seo_title) || 0) + 1);
      }
    });

    const duplicateCount = Array.from(duplicateTitles.values()).filter(count => count > 1).length;

    return {
      totalPages,
      indexablePages,
      noindexPages,
      validTitles,
      validDescriptions,
      missingTitles,
      missingDescriptions,
      duplicateCount,
      healthScore: Math.round(((validTitles + validDescriptions) / (totalPages * 2)) * 100)
    };
  }, [data]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Total Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPages}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Indexable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.indexablePages}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Ban className="h-4 w-4 text-muted-foreground" />
            NoIndex
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.noindexPages}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Valid Titles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.validTitles}/{stats.totalPages}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent" />
            Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {stats.missingTitles + stats.missingDescriptions + stats.duplicateCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.duplicateCount > 0 && `${stats.duplicateCount} duplicates`}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            'text-2xl font-bold',
            stats.healthScore >= 80 && 'text-primary',
            stats.healthScore >= 60 && stats.healthScore < 80 && 'text-accent',
            stats.healthScore < 60 && 'text-destructive'
          )}>
            {stats.healthScore}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
