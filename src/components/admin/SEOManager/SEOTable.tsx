'use client';

import { useState, useCallback, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle2, AlertTriangle, Save, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { PageSEO, PageSEOUpdate, useUpdateSEO, validateSEOTitle, validateMetaDescription, SEO_LIMITS } from '@/hooks/useSEOData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import React from 'react';

interface SEOTableProps {
  data: PageSEO[];
  filter: string;
  typeFilter: string;
}

function CharacterCount({ current, min, max, recommended }: { current: number; min: number; max: number; recommended: number }) {
  const isShort = current < min;
  const isLong = current > max;
  const isGood = current >= min && current <= recommended;

  return (
    <span className={cn(
      'text-xs font-mono',
      isShort && 'text-accent',
      isLong && 'text-destructive',
      isGood && 'text-primary',
      !isShort && !isLong && !isGood && 'text-muted-foreground'
    )}>
      {current}/{max}
    </span>
  );
}

function ValidationIcon({ valid, warning, error }: { valid: boolean; warning?: string; error?: string }) {
  if (error) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </TooltipTrigger>
        <TooltipContent>{error}</TooltipContent>
      </Tooltip>
    );
  }
  if (warning) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <AlertTriangle className="h-4 w-4 text-accent" />
        </TooltipTrigger>
        <TooltipContent>{warning}</TooltipContent>
      </Tooltip>
    );
  }
  if (valid) {
    return <CheckCircle2 className="h-4 w-4 text-primary" />;
  }
  return null;
}

export function SEOTable({ data, filter, typeFilter }: SEOTableProps) {
  const updateSEO = useUpdateSEO();
  const [pendingChanges, setPendingChanges] = useState<Record<string, PageSEOUpdate>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(page => {
      const matchesSearch = filter === '' ||
        page.page_name.toLowerCase().includes(filter.toLowerCase()) ||
        page.page_path.toLowerCase().includes(filter.toLowerCase()) ||
        (page.seo_title?.toLowerCase().includes(filter.toLowerCase()) ?? false);

      const matchesType = typeFilter === 'all' || page.page_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [data, filter, typeFilter]);

  // Track pending changes for a row
  const updatePending = useCallback((id: string, field: keyof PageSEOUpdate, value: unknown) => {
    setPendingChanges(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      }
    }));
  }, []);

  // Get the current value (pending or original)
  const getValue = useCallback((page: PageSEO, field: keyof PageSEO) => {
    const pending = pendingChanges[page.id];
    if (pending && field in pending) {
      return pending[field as keyof PageSEOUpdate];
    }
    return page[field];
  }, [pendingChanges]);

  // Save changes for a row
  const saveRow = useCallback(async (id: string) => {
    const changes = pendingChanges[id];
    if (!changes || Object.keys(changes).length === 0) return;

    try {
      await updateSEO.mutateAsync({ id, updates: changes });
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.success('SEO data saved');
    } catch (err) {
      toast.error('Failed to save SEO data');
    }
  }, [pendingChanges, updateSEO]);

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasChanges = (id: string) => {
    return pendingChanges[id] && Object.keys(pendingChanges[id]).length > 0;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-8"></TableHead>
            <TableHead className="w-[180px]">Page</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="w-[60px]">Index</TableHead>
            <TableHead className="min-w-[280px]">SEO Title</TableHead>
            <TableHead className="min-w-[320px]">Meta Description</TableHead>
            <TableHead className="w-[140px]">Primary Keyword</TableHead>
            <TableHead className="w-[120px]">Schema</TableHead>
            <TableHead className="w-[100px]">Priority</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((page) => {
            const isExpanded = expandedRows.has(page.id);
            const titleValidation = validateSEOTitle(getValue(page, 'seo_title') as string | null);
            const descValidation = validateMetaDescription(getValue(page, 'meta_description') as string | null);
            const currentTitle = (getValue(page, 'seo_title') as string) || '';
            const currentDesc = (getValue(page, 'meta_description') as string) || '';

            return (
              <React.Fragment key={page.id}>
                <TableRow className={cn(
                  'hover:bg-muted/30 transition-colors',
                  hasChanges(page.id) && 'bg-primary/5'
                )}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleRow(page.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm truncate max-w-[160px]" title={page.page_name}>
                        {page.page_name}
                      </span>
                      <a
                        href={page.page_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate max-w-[160px]"
                      >
                        {page.page_path}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {page.page_type}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Switch
                      checked={getValue(page, 'is_indexable') as boolean}
                      onCheckedChange={(checked) => updatePending(page.id, 'is_indexable', checked)}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={currentTitle}
                          onChange={(e) => updatePending(page.id, 'seo_title', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="SEO Title..."
                        />
                        <ValidationIcon {...titleValidation} />
                      </div>
                      <CharacterCount
                        current={currentTitle.length}
                        min={SEO_LIMITS.title.min}
                        max={SEO_LIMITS.title.max}
                        recommended={SEO_LIMITS.title.recommended}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Textarea
                          value={currentDesc}
                          onChange={(e) => updatePending(page.id, 'meta_description', e.target.value)}
                          className="h-16 text-sm resize-none"
                          placeholder="Meta description..."
                        />
                        <ValidationIcon {...descValidation} />
                      </div>
                      <CharacterCount
                        current={currentDesc.length}
                        min={SEO_LIMITS.description.min}
                        max={SEO_LIMITS.description.max}
                        recommended={SEO_LIMITS.description.recommended}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Input
                      value={(getValue(page, 'primary_keyword') as string) || ''}
                      onChange={(e) => updatePending(page.id, 'primary_keyword', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Keyword..."
                    />
                  </TableCell>

                  <TableCell>
                    <Select
                      value={getValue(page, 'schema_type') as string}
                      onValueChange={(value) => updatePending(page.id, 'schema_type', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
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
                  </TableCell>

                  <TableCell>
                    <Select
                      value={String(getValue(page, 'priority'))}
                      onValueChange={(value) => updatePending(page.id, 'priority', parseFloat(value))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.0">1.0 (High)</SelectItem>
                        <SelectItem value="0.9">0.9</SelectItem>
                        <SelectItem value="0.8">0.8</SelectItem>
                        <SelectItem value="0.7">0.7</SelectItem>
                        <SelectItem value="0.6">0.6</SelectItem>
                        <SelectItem value="0.5">0.5 (Normal)</SelectItem>
                        <SelectItem value="0.4">0.4</SelectItem>
                        <SelectItem value="0.3">0.3 (Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    {hasChanges(page.id) && (
                      <Button
                        size="sm"
                        onClick={() => saveRow(page.id)}
                        disabled={updateSEO.isPending}
                        className="h-8"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    )}
                  </TableCell>
                </TableRow>

                {/* Expanded row for OG/Twitter/Canonical */}
                {isExpanded && (
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={10}>
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Canonical URL</label>
                          <Input
                            value={(getValue(page, 'canonical_url') as string) || ''}
                            onChange={(e) => updatePending(page.id, 'canonical_url', e.target.value || null)}
                            className="h-8 text-sm"
                            placeholder="Leave blank for auto"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">OG Title</label>
                          <Input
                            value={(getValue(page, 'og_title') as string) || ''}
                            onChange={(e) => updatePending(page.id, 'og_title', e.target.value || null)}
                            className="h-8 text-sm"
                            placeholder="Falls back to SEO title"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">OG Description</label>
                          <Input
                            value={(getValue(page, 'og_description') as string) || ''}
                            onChange={(e) => updatePending(page.id, 'og_description', e.target.value || null)}
                            className="h-8 text-sm"
                            placeholder="Falls back to meta description"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">OG Image URL</label>
                          <Input
                            value={(getValue(page, 'og_image') as string) || ''}
                            onChange={(e) => updatePending(page.id, 'og_image', e.target.value || null)}
                            className="h-8 text-sm"
                            placeholder="https://..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Change Frequency</label>
                          <Select
                            value={getValue(page, 'change_frequency') as string}
                            onValueChange={(value) => updatePending(page.id, 'change_frequency', value)}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Last Updated</label>
                          <div className="text-sm text-muted-foreground pt-2">
                            {new Date(page.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {filteredData.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No pages match your search criteria
        </div>
      )}
    </div>
  );
}
