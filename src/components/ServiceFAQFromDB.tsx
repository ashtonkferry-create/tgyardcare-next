'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useFAQsByService } from '@/hooks/useFAQs';
import { useServiceBySlug } from '@/hooks/useServices';

interface ServiceFAQFromDBProps {
  serviceSlug: string;
  className?: string;
}

export function ServiceFAQFromDB({ serviceSlug, className = '' }: ServiceFAQFromDBProps) {
  const { data: service } = useServiceBySlug(serviceSlug);
  const { data: faqs, isLoading } = useFAQsByService(service?.id ?? '');

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse border rounded-lg p-4">
            <div className="h-5 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className={className}>
      {faqs.map((faq, index) => (
        <AccordionItem key={faq.id} value={`item-${index}`}>
          <AccordionTrigger className="text-left">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default ServiceFAQFromDB;
