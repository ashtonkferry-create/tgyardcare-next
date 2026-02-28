'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSeasonalTheme, Season } from '@/contexts/SeasonalThemeContext';
import { SeasonalBadge } from '@/components/SeasonalBadge';
import { Leaf, Sun, CloudRain, Snowflake, Eye, RefreshCw } from 'lucide-react';

type SeasonOverrideType = 'auto' | Season;

export default function AdminSeasons() {
  const { toast } = useToast();
  const { activeSeason, currentSeason, seasonSettings, refreshData, setPreviewSeason, isPreviewMode } = useSeasonalTheme();
  const [override, setOverride] = useState<SeasonOverrideType>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [previewingSeason, setPreviewingSeason] = useState<Season | null>(null);

  useEffect(() => {
    fetchOverride();
  }, []);

  const fetchOverride = async () => {
    const { data } = await supabase.from('season_override').select('*').limit(1).single();
    if (data) {
      setOverride(data.active_override as SeasonOverrideType);
    }
  };

  const handleOverrideChange = async (value: SeasonOverrideType) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('season_override')
        .update({ active_override: value })
        .not('id', 'is', null);

      if (error) throw error;

      setOverride(value);
      await refreshData();
      toast({ title: 'Theme override updated', description: `Active theme is now: ${value === 'auto' ? 'Auto (based on date)' : value}` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update override', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (season: Season | null) => {
    setPreviewingSeason(season);
    setPreviewSeason(season);
  };

  // 3-season system: summer (includes spring dates), fall, winter
  const seasonIcons: Record<Season, typeof Leaf> = {
    summer: Sun,
    fall: CloudRain,
    winter: Snowflake,
  };

  const seasonColors: Record<Season, string> = {
    summer: 'bg-green-500/10 border-green-500/30 text-green-700',
    fall: 'bg-orange-500/10 border-orange-500/30 text-orange-700',
    winter: 'bg-sky-500/10 border-sky-500/30 text-sky-700',
  };

  return (
    <AdminLayout title="Seasonal Theme Manager">
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Date-Based Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {(() => { const Icon = seasonIcons[currentSeason]; return <Icon className="h-5 w-5" />; })()}
                <span className="text-2xl font-bold capitalize">{currentSeason}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <SeasonalBadge size="md" />
              {isPreviewMode && <p className="text-xs text-muted-foreground mt-1">Preview mode active</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Override Status</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-2xl font-bold ${override === 'auto' ? 'text-green-600' : 'text-orange-600'}`}>
                {override === 'auto' ? 'Auto' : override.charAt(0).toUpperCase() + override.slice(1)}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Theme Override Control */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Override</CardTitle>
            <CardDescription>
              Force a specific season theme or let it auto-select based on the current date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {(['auto', 'summer', 'fall', 'winter'] as SeasonOverrideType[]).map((season) => {
                const Icon = season !== 'auto' ? seasonIcons[season as Season] : RefreshCw;
                const colorClass = season !== 'auto' ? seasonColors[season as Season] : '';
                return (
                  <Button
                    key={season}
                    variant={override === season ? 'default' : 'outline'}
                    className={`capitalize flex items-center gap-2 ${override !== season && season !== 'auto' ? colorClass : ''}`}
                    onClick={() => handleOverrideChange(season)}
                    disabled={isLoading}
                  >
                    <Icon className="h-4 w-4" />
                    {season === 'auto' ? 'Auto' : season}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Preview Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview Theme
            </CardTitle>
            <CardDescription>
              Preview how the site looks with different seasonal themes without saving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['summer', 'fall', 'winter'] as Season[]).map((season) => {
                const Icon = seasonIcons[season];
                return (
                  <Button
                    key={season}
                    variant={previewingSeason === season ? 'default' : 'outline'}
                    size="sm"
                    className={`capitalize flex items-center gap-2 ${previewingSeason !== season ? seasonColors[season] : ''}`}
                    onClick={() => handlePreview(previewingSeason === season ? null : season)}
                  >
                    <Icon className="h-4 w-4" />
                    Preview {season}
                  </Button>
                );
              })}
              {previewingSeason && (
                <Button variant="ghost" size="sm" onClick={() => handlePreview(null)}>
                  Exit Preview
                </Button>
              )}
            </div>
            {previewingSeason && (
              <p className="text-sm text-orange-600 font-medium">
                Preview mode active: Viewing {previewingSeason} theme. Open homepage to see changes.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Season Date Ranges */}
        <Card>
          <CardHeader>
            <CardTitle>Season Date Ranges</CardTitle>
            <CardDescription>Configure when each season starts and ends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {seasonSettings.filter(s => ['summer', 'fall', 'winter'].includes(s.season)).map((setting) => {
                const Icon = seasonIcons[setting.season as Season] || Sun;
                return (
                  <div key={setting.season} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold capitalize">{setting.season}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {setting.start_month}/{setting.start_day} – {setting.end_month}/{setting.end_day}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              To edit date ranges, slides, or priority services, use the database directly or contact support.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => refreshData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
