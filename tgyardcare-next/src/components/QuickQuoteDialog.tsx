'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSeasonalTheme, Season } from '@/contexts/SeasonalThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { validateContactForm } from '@/lib/validation';

const dialogTheme = {
  winter: {
    headerBg: 'bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950',
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/20',
    buttonBg: 'bg-cyan-500 hover:bg-cyan-400 text-white',
    focusRing: 'focus-visible:ring-cyan-500',
    successBg: 'bg-cyan-500/10',
    successText: 'text-cyan-400',
    successBorder: 'border-cyan-500/20',
  },
  summer: {
    headerBg: 'bg-gradient-to-r from-[#132e1b] via-[#1a3a25] to-[#0f3320]',
    accentColor: 'text-green-400',
    accentBg: 'bg-green-500/10',
    accentBorder: 'border-green-500/20',
    buttonBg: 'bg-green-600 hover:bg-green-500 text-white',
    focusRing: 'focus-visible:ring-green-500',
    successBg: 'bg-green-500/10',
    successText: 'text-green-400',
    successBorder: 'border-green-500/20',
  },
  fall: {
    headerBg: 'bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/20',
    buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white',
    focusRing: 'focus-visible:ring-amber-500',
    successBg: 'bg-amber-500/10',
    successText: 'text-amber-400',
    successBorder: 'border-amber-500/20',
  },
} as const;

interface QuickQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoService: string;
  promoDiscount: string;
}

export default function QuickQuoteDialog({
  open,
  onOpenChange,
  promoService,
  promoDiscount,
}: QuickQuoteDialogProps) {
  const { activeSeason } = useSeasonalTheme();
  const dt = dialogTheme[activeSeason] ?? dialogTheme.summer;
  const { toast } = useToast();

  const prefillMessage = `Hi TotalGuard! I saw your ${promoDiscount} OFF deal on ${promoService} and I'd love to claim this offer. Please send me a quote!`;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    message: prefillMessage,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = validateContactForm(formData);

      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: validatedData,
      });

      if (error) {
        throw new Error(error.message || 'Failed to submit form');
      }

      if (!data?.success) {
        throw new Error('Failed to submit form');
      }

      setIsSuccess(true);
    } catch (error) {
      toast({
        title: 'Submission Error',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        message: prefillMessage,
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Themed header */}
        <div className={`${dt.headerBg} px-6 pt-6 pb-4`}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Claim Your {promoDiscount} OFF Deal
            </DialogTitle>
            <DialogDescription className="text-white/70 text-sm">
              {promoService} — fill out a few details and we'll send your quote within 24 hours.
            </DialogDescription>
          </DialogHeader>
        </div>

        {isSuccess ? (
          /* Success state */
          <div className="p-6 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${dt.successBg} border ${dt.successBorder} mb-4`}>
              <CheckCircle2 className={`h-8 w-8 ${dt.successText}`} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Quote Request Sent!</h3>
            <p className="text-muted-foreground text-sm mb-4">
              We'll get back to you within 24 hours — usually much faster.
            </p>
            <div className={`flex items-center justify-center gap-2 text-xs ${dt.accentColor} ${dt.accentBg} px-3 py-2 rounded-lg border ${dt.accentBorder}`}>
              <Mail className="h-3.5 w-3.5" />
              <span>Confirmation from totalguardllc@gmail.com</span>
            </div>
            <Button onClick={handleClose} className="mt-6 w-full" variant="outline">
              Close
            </Button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="qq-name" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Full Name
                </label>
                <Input
                  id="qq-name"
                  name="name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={dt.focusRing}
                />
              </div>
              <div>
                <label htmlFor="qq-email" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Email
                </label>
                <Input
                  id="qq-email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={dt.focusRing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="qq-phone" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Phone
                </label>
                <Input
                  id="qq-phone"
                  name="phone"
                  type="tel"
                  placeholder="(608) 555-1234"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={dt.focusRing}
                />
              </div>
              <div>
                <label htmlFor="qq-address" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Address
                </label>
                <Input
                  id="qq-address"
                  name="address"
                  placeholder="123 Main St, Madison"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className={dt.focusRing}
                />
              </div>
            </div>

            <div>
              <label htmlFor="qq-message" className="text-xs font-medium text-muted-foreground mb-1 block">
                Message
              </label>
              <Textarea
                id="qq-message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                required
                className={`resize-none ${dt.focusRing}`}
              />
            </div>

            {/* Contact info strip */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Phone className={`h-3 w-3 ${dt.accentColor}`} />
                (608) 535-6057
              </span>
              <span className="flex items-center gap-1">
                <Mail className={`h-3 w-3 ${dt.accentColor}`} />
                totalguardllc@gmail.com
              </span>
              <span className="flex items-center gap-1">
                <MapPin className={`h-3 w-3 ${dt.accentColor}`} />
                Dane County, WI
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-bold ${dt.buttonBg}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Claim This Offer
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
