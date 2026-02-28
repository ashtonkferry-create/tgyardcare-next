'use client';

import Link from "next/link";
import { Home, Phone, Mail } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Oops! This Page Went Off the Grid
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Looks like this lawn needs some attention. The page you&apos;re looking for doesn&apos;t exist,
              but don&apos;t worry—we&apos;re here to help you get back on track!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/contact">
                <Mail className="w-5 h-5" />
                Get a Free Quote
              </Link>
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Need Help Finding Something?
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <Link href="/services/mowing" className="text-primary hover:underline">
                → Lawn Mowing Services
              </Link>
              <Link href="/services/gutter-cleaning" className="text-primary hover:underline">
                → Gutter Cleaning
              </Link>
              <Link href="/services/spring-cleanup" className="text-primary hover:underline">
                → Spring Cleanup
              </Link>
              <Link href="/services/fall-cleanup" className="text-primary hover:underline">
                → Fall Cleanup
              </Link>
              <Link href="/gallery" className="text-primary hover:underline">
                → View Our Work
              </Link>
              <Link href="/about" className="text-primary hover:underline">
                → About Us
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>Or call us directly: </span>
            <a href="tel:608-535-6057" className="text-primary font-semibold hover:underline">
              (608) 535-6057
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
