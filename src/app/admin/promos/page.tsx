'use client';

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface Promo {
  id: string;
  service: string;
  discount: string;
  path: string;
  seasons: Season[];
  duration_hours: number;
  is_active: boolean;
  display_order: number;
}

const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: 'Spring (Mar-May)' },
  { value: 'summer', label: 'Summer (Jun-Aug)' },
  { value: 'fall', label: 'Fall (Sep-Nov)' },
  { value: 'winter', label: 'Winter (Dec-Feb)' },
];

const SERVICE_PATHS = [
  { value: '/services/spring-cleanup', label: 'Spring Cleanup' },
  { value: '/services/fall-cleanup', label: 'Fall Cleanup' },
  { value: '/services/mowing', label: 'Mowing' },
  { value: '/services/weeding', label: 'Weeding' },
  { value: '/services/mulching', label: 'Mulching' },
  { value: '/services/leaf-removal', label: 'Leaf Removal' },
  { value: '/services/gutter-cleaning', label: 'Gutter Cleaning' },
  { value: '/services/gutter-guards', label: 'Gutter Guards' },
  { value: '/services/garden-beds', label: 'Garden Beds' },
  { value: '/services/fertilization', label: 'Fertilization' },
  { value: '/services/herbicide', label: 'Herbicide Treatment' },
  { value: '/services/pruning', label: 'Pruning' },
  { value: '/services/snow-removal', label: 'Snow Removal' },
];

const getCurrentSeason = (): Season => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

export default function AdminPromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    discount: '',
    path: '',
    seasons: [] as Season[],
    duration_hours: 24,
    is_active: true,
  });

  const currentSeason = getCurrentSeason();

  const fetchPromos = async () => {
    const { data, error } = await supabase
      .from('promo_settings')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch promotions');
      return;
    }

    setPromos(data as Promo[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const resetForm = () => {
    setFormData({
      service: '',
      discount: '',
      path: '',
      seasons: [],
      duration_hours: 24,
      is_active: true,
    });
    setEditingPromo(null);
  };

  const openEditDialog = (promo: Promo) => {
    setEditingPromo(promo);
    setFormData({
      service: promo.service,
      discount: promo.discount,
      path: promo.path,
      seasons: promo.seasons,
      duration_hours: promo.duration_hours,
      is_active: promo.is_active,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.service || !formData.discount || !formData.path || formData.seasons.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingPromo) {
      const { error } = await supabase
        .from('promo_settings')
        .update({
          service: formData.service,
          discount: formData.discount,
          path: formData.path,
          seasons: formData.seasons,
          duration_hours: formData.duration_hours,
          is_active: formData.is_active,
        })
        .eq('id', editingPromo.id);

      if (error) {
        toast.error('Failed to update promotion');
        return;
      }
      toast.success('Promotion updated');
    } else {
      const maxOrder = Math.max(...promos.map(p => p.display_order), 0);
      const { error } = await supabase
        .from('promo_settings')
        .insert({
          service: formData.service,
          discount: formData.discount,
          path: formData.path,
          seasons: formData.seasons,
          duration_hours: formData.duration_hours,
          is_active: formData.is_active,
          display_order: maxOrder + 1,
        });

      if (error) {
        toast.error('Failed to create promotion');
        return;
      }
      toast.success('Promotion created');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchPromos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    const { error } = await supabase
      .from('promo_settings')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete promotion');
      return;
    }

    toast.success('Promotion deleted');
    fetchPromos();
  };

  const toggleActive = async (promo: Promo) => {
    const { error } = await supabase
      .from('promo_settings')
      .update({ is_active: !promo.is_active })
      .eq('id', promo.id);

    if (error) {
      toast.error('Failed to update promotion');
      return;
    }

    fetchPromos();
  };

  const handleSeasonToggle = (season: Season) => {
    setFormData(prev => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter(s => s !== season)
        : [...prev.seasons, season],
    }));
  };

  const activePromos = promos.filter(p => p.is_active && p.seasons.includes(currentSeason));

  return (
    <AdminLayout title="Promotions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Promotional Discounts</h2>
            <p className="text-muted-foreground">
              Manage rotating promotional banners. Current season: <Badge variant="secondary">{currentSeason}</Badge>
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPromo ? 'Edit Promotion' : 'New Promotion'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Service Name *</Label>
                  <Input
                    value={formData.service}
                    onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                    placeholder="e.g., Gutter Cleaning"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount *</Label>
                  <Input
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="e.g., 15%"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Page Path *</Label>
                  <Select
                    value={formData.path}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, path: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service page" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_PATHS.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seasons *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SEASONS.map((season) => (
                      <div key={season.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={season.value}
                          checked={formData.seasons.includes(season.value)}
                          onCheckedChange={() => handleSeasonToggle(season.value)}
                        />
                        <Label htmlFor={season.value} className="text-sm font-normal">
                          {season.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 24 }))}
                    min={1}
                    max={168}
                  />
                  <p className="text-xs text-muted-foreground">How long each promo shows before rotating (1-168 hours)</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {editingPromo ? 'Update' : 'Create'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Season Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active This Season ({activePromos.length} promos)</CardTitle>
          </CardHeader>
          <CardContent>
            {activePromos.length === 0 ? (
              <p className="text-muted-foreground">No promotions active for {currentSeason}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activePromos.map((promo) => (
                  <Badge key={promo.id} variant="default">
                    {promo.discount} off {promo.service}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Promotions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded" />
                ))}
              </div>
            ) : promos.length === 0 ? (
              <p className="text-muted-foreground">No promotions configured</p>
            ) : (
              <div className="space-y-2">
                {promos.map((promo) => (
                  <div
                    key={promo.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      promo.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{promo.service}</span>
                        <Badge variant="outline">{promo.discount}</Badge>
                        {!promo.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {promo.seasons.map((season) => (
                          <Badge
                            key={season}
                            variant={season === currentSeason ? "default" : "outline"}
                            className="text-xs"
                          >
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {promo.duration_hours}h rotation
                    </div>

                    <Switch
                      checked={promo.is_active}
                      onCheckedChange={() => toggleActive(promo)}
                    />

                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(promo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
