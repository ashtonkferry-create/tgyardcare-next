'use client';

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  image?: string;
}

export default function ServiceCard({ icon: Icon, title, description, path, image }: ServiceCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 h-full border-border hover:border-primary/50 hover:-translate-y-1 overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section */}
        {image && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={image}
              alt={`${title} service - Professional lawn care in Madison Wisconsin by TotalGuard`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              width="400"
              height="192"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-muted-foreground mb-6 flex-grow leading-relaxed text-sm">{description}</p>
          <Link href={path} className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors group/link">
            Learn More
            <span className="ml-2 group-hover/link:ml-3 transition-all">&rarr;</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
