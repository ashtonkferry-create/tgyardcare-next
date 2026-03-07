'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2, CheckSquare, FileText, Copy, Check } from "lucide-react";
import { toast } from "sonner";

// Weekly checklist items
const checklistItems = [
  { id: "gbp-post", label: "Post to Google Business Profile" },
  { id: "review-replies", label: "Reply to new reviews" },
  { id: "add-photos", label: "Add new photos to GBP" },
  { id: "citation-check", label: "Check NAP consistency on citations" },
  { id: "social-post", label: "Post to social media" },
];

export default function ToolsPanel() {
  const [utmParams, setUtmParams] = useState({
    url: "https://tgyardcare.com",
    source: "",
    medium: "",
    campaign: "",
    content: "",
  });
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Load saved data from localStorage
  useEffect(() => {
    const savedChecklist = localStorage.getItem("admin-checklist");
    const savedNotes = localStorage.getItem("admin-notes");
    if (savedChecklist) setCheckedItems(JSON.parse(savedChecklist));
    if (savedNotes) setNotes(savedNotes);
  }, []);

  // Save checklist to localStorage
  useEffect(() => {
    localStorage.setItem("admin-checklist", JSON.stringify(checkedItems));
  }, [checkedItems]);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("admin-notes", notes);
  }, [notes]);

  const generateUTMUrl = () => {
    const params = new URLSearchParams();
    if (utmParams.source) params.set("utm_source", utmParams.source);
    if (utmParams.medium) params.set("utm_medium", utmParams.medium);
    if (utmParams.campaign) params.set("utm_campaign", utmParams.campaign);
    if (utmParams.content) params.set("utm_content", utmParams.content);

    const url = params.toString()
      ? `${utmParams.url}?${params.toString()}`
      : utmParams.url;
    setGeneratedUrl(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheckItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const resetChecklist = () => {
    setCheckedItems([]);
    toast.success("Checklist reset for new week");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Tools</h2>
        <p className="text-muted-foreground">
          Utilities for campaign tracking, weekly tasks, and notes.
        </p>
      </div>

      {/* UTM Builder */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            UTM Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="url">Base URL</Label>
              <Input
                id="url"
                value={utmParams.url}
                onChange={(e) => setUtmParams({ ...utmParams, url: e.target.value })}
                placeholder="https://www.tgyardcare.com"
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={utmParams.source}
                onChange={(e) => setUtmParams({ ...utmParams, source: e.target.value })}
                placeholder="google, facebook, email"
              />
            </div>
            <div>
              <Label htmlFor="medium">Medium</Label>
              <Input
                id="medium"
                value={utmParams.medium}
                onChange={(e) => setUtmParams({ ...utmParams, medium: e.target.value })}
                placeholder="cpc, social, newsletter"
              />
            </div>
            <div>
              <Label htmlFor="campaign">Campaign</Label>
              <Input
                id="campaign"
                value={utmParams.campaign}
                onChange={(e) => setUtmParams({ ...utmParams, campaign: e.target.value })}
                placeholder="spring-promo-2025"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="content">Content (optional)</Label>
              <Input
                id="content"
                value={utmParams.content}
                onChange={(e) => setUtmParams({ ...utmParams, content: e.target.value })}
                placeholder="hero-banner, sidebar-cta"
              />
            </div>
          </div>

          <Button onClick={generateUTMUrl} className="w-full sm:w-auto">
            Generate URL
          </Button>

          {generatedUrl && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm break-all flex-1">{generatedUrl}</code>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Checklist */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Weekly Checklist
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={resetChecklist}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => toggleCheckItem(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className={`text-sm cursor-pointer ${
                    checkedItems.includes(item.id) ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {checkedItems.length} of {checklistItems.length} tasks complete
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(checkedItems.length / checklistItems.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes, reminders, or to-dos..."
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Notes are saved automatically to your browser.
          </p>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="https://business.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors"
            >
              <p className="text-sm font-medium">Google Business</p>
            </a>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors"
            >
              <p className="text-sm font-medium">GA4</p>
            </a>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors"
            >
              <p className="text-sm font-medium">Search Console</p>
            </a>
            <a
              href="https://www.tgyardcare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors"
            >
              <p className="text-sm font-medium">Live Site</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
