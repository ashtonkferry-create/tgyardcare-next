'use client';

import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ServiceSchema } from "@/components/ServiceSchema";
import { MapPin, CheckCircle2, Phone, Star, ArrowRight, Sparkles, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const serviceAreas = [
  "Madison",
  "Middleton",
  "Monona",
  "Sun Prairie",
  "Fitchburg",
  "Verona",
  "McFarland",
  "Cottage Grove",
  "Waunakee",
  "DeForest",
  "Oregon",
  "Stoughton"
];

const services = [
  { name: "Lawn mowing & maintenance", path: "/services/mowing", icon: "🏡" },
  { name: "Spring cleanup", path: "/services/spring-cleanup", icon: "🌱" },
  { name: "Fall cleanup", path: "/services/fall-cleanup", icon: "🍂" },
  { name: "Leaf removal", path: "/services/leaf-removal", icon: "🍃" },
  { name: "Gutter cleaning", path: "/services/gutter-cleaning", icon: "🏠" },
  { name: "Gutter guard installation", path: "/services/gutter-guards", icon: "🛡️" },
  { name: "Mulching services", path: "/services/mulching", icon: "🪵" },
  { name: "Garden bed makeovers", path: "/services/garden-beds", icon: "🌺" },
  { name: "Weeding", path: "/services/weeding", icon: "🌿" },
  { name: "Fertilization & overseeding", path: "/services/fertilization", icon: "🌾" },
  { name: "Herbicide application", path: "/services/herbicide", icon: "🌱" },
  { name: "Snow removal", path: "/services/snow-removal", icon: "❄️" }
];

const areaFeatures = [
  { title: "Fast Response", desc: "Same-day quotes in all service areas" },
  { title: "Local Expertise", desc: "We know Wisconsin lawns inside and out" },
  { title: "Fully Insured", desc: "Licensed and insured in all communities we serve" }
];

export default function ServiceAreasContent() {
  return (
    <div className="min-h-screen bg-background">
      <ServiceSchema
        serviceName="TotalGuard Yard Care - Service Areas"
        description="Professional lawn care and property maintenance services throughout Madison, Middleton, Waunakee, and 9+ surrounding Wisconsin communities."
        serviceType="Lawn Care and Property Maintenance Services"
        areaServed={serviceAreas}
      />
      <Navigation />

      {/* TL;DR for AI/Answer Engines */}
      <section className="sr-only" aria-label="Service Areas Summary">
        <p>TotalGuard Yard Care serves 12+ communities in the Madison, Wisconsin metro area including Madison, Middleton, Waunakee, Sun Prairie, Fitchburg, Verona, Monona, McFarland, DeForest, Cottage Grove, Oregon, and Stoughton. Services include mowing, gutter cleaning, seasonal cleanups, and more. Call (608) 535-6057 for a free quote.</p>
      </section>

      {/* Hero with Map Background */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="map-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <circle cx="50" cy="50" r="2" fill="hsl(var(--primary))" opacity="0.5"/>
                  <line x1="50" y1="0" x2="50" y2="100" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3"/>
                  <line x1="0" y1="50" x2="100" y2="50" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)"/>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary px-6 py-3 rounded-full text-sm font-bold mb-6 animate-pulse">
              <Award className="h-5 w-5" />
              Serving 12+ Communities Across Wisconsin
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Professional lawn care throughout <span className="text-primary">Madison &amp; surrounding areas</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              From <Link href="/services/mowing" className="text-primary hover:underline font-semibold">lawn mowing</Link> and <Link href="/services/gutter-cleaning" className="text-primary hover:underline font-semibold">gutter cleaning</Link> to <Link href="/services/spring-cleanup" className="text-primary hover:underline font-semibold">seasonal cleanups</Link>, we bring professional yard care to your neighborhood in Madison, Middleton, Waunakee, and beyond.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
              {areaFeatures.map((feature, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{idx === 0 ? "24hrs" : idx === 1 ? "12+" : "100%"}</div>
                  <div className="text-sm text-muted-foreground font-medium">{feature.title}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/contact">
                  Get a Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <a href="tel:608-535-6057">
                  <Phone className="mr-2 h-5 w-5" />
                  (608) 535-6057
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose TotalGuard in Your Area */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why homeowners trust TotalGuard in every community
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you&apos;re in Madison or Waunakee, you get the same exceptional service and dedication
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {areaFeatures.map((feature, idx) => (
                <Card key={idx} className="p-8 text-center hover:shadow-xl transition-all border-2 hover:border-primary">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Star className="h-8 w-8 text-primary fill-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 rounded-2xl p-8 text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Looking for <Link href="/commercial" className="text-primary hover:underline">commercial services</Link>?
              </h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                We also provide professional <Link href="/commercial/lawn-care" className="text-primary hover:underline font-semibold">commercial lawn care</Link>, <Link href="/commercial/gutters" className="text-primary hover:underline font-semibold">gutter services</Link>, and <Link href="/commercial/seasonal" className="text-primary hover:underline font-semibold">seasonal maintenance</Link> for businesses and properties throughout our service area.
              </p>
              <Button size="lg" asChild>
                <Link href="/commercial">
                  Explore Commercial Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                12 communities served across Wisconsin
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From downtown Madison to the suburbs, we bring professional <Link href="/services/mowing" className="text-primary hover:underline font-semibold">lawn care</Link> and <Link href="/services/gutter-cleaning" className="text-primary hover:underline font-semibold">property maintenance</Link> directly to your neighborhood
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {serviceAreas.map((area, index) => {
                const slug = area.toLowerCase().replace(/\s+/g, '-');
                const locationPath = `/locations/${slug}`;

                return (
                  <Link key={index} href={locationPath}>
                    <Card className="p-8 text-center hover:shadow-xl hover:border-primary transition-all border group cursor-pointer bg-card">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{area}</h3>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="bg-muted/50 border-2 border-border rounded-xl p-8 text-center">
              <p className="text-lg text-muted-foreground mb-2">
                <strong className="text-foreground">Don&apos;t see your neighborhood?</strong>
              </p>
              <p className="text-muted-foreground mb-6">
                We&apos;re constantly expanding! <a href="tel:920-629-6934" className="text-primary font-bold hover:underline">Call us at (920) 629-6934</a> to check if we can serve your area
              </p>
              <Button variant="outline" size="lg" asChild>
                <a href="tel:920-629-6934">
                  <Phone className="mr-2 h-5 w-5" />
                  Check Your Area
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* All Services Available */}
      <section className="py-20 bg-gradient-to-br from-secondary/30 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Complete lawn care services in every community we serve
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Whether you need weekly <Link href="/services/mowing" className="text-primary hover:underline font-semibold">lawn mowing</Link> in Madison, <Link href="/services/gutter-cleaning" className="text-primary hover:underline font-semibold">gutter cleaning</Link> in Middleton, or <Link href="/services/snow-removal" className="text-primary hover:underline font-semibold">snow removal</Link> in Waunakee — we&apos;ve got you covered
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <Link key={index} href={service.path}>
                  <Card className="p-8 hover:shadow-xl hover:border-primary transition-all border group h-full bg-card">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl flex-shrink-0">{service.icon}</div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center bg-card border-2 border-primary/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Need multiple services?
              </h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Bundle <Link href="/services/mowing" className="text-primary hover:underline font-semibold">lawn mowing</Link>, <Link href="/services/weeding" className="text-primary hover:underline font-semibold">weeding</Link>, <Link href="/services/mulching" className="text-primary hover:underline font-semibold">mulching</Link>, and more for the best value. Check out our full <Link href="/gallery" className="text-primary hover:underline font-semibold">gallery of completed projects</Link>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/contact">
                    Get Custom Package Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/team">
                    <Star className="mr-2 h-5 w-5" />
                    Meet Our Team
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                See exactly where we serve
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From <Link href="/services/spring-cleanup" className="text-primary hover:underline font-semibold">spring cleanup</Link> to <Link href="/services/fall-cleanup" className="text-primary hover:underline font-semibold">fall cleanup</Link>, <Link href="/services/leaf-removal" className="text-primary hover:underline font-semibold">leaf removal</Link> to <Link href="/services/fertilization" className="text-primary hover:underline font-semibold">fertilization</Link> — every service, every season, in every community below
              </p>
            </div>

            <Card className="overflow-hidden border-2 p-0">
              <div className="bg-muted" style={{ height: "600px" }}>
                <iframe
                  title="TotalGuard Yard Care service area map - Madison, Middleton, Waunakee Wisconsin and surrounding areas"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d93276.28645682166!2d-89.54097545!3d43.0747610!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8806536d3a2019ff%3A0x4e0cfcb5ba484198!2sMadison%2C%20WI!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus&z=11"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="bg-card p-6 border-t-2">
                <p className="text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">Coverage includes:</strong> Madison, Middleton, Waunakee, Monona, Sun Prairie, Fitchburg, Verona, McFarland, Cottage Grove, DeForest, Oregon, and Stoughton
                </p>
              </div>
            </Card>

            {/* Additional Local SEO Content */}
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <Card className="p-8 border-2">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Residential lawn care experts
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Homeowners throughout Madison, Middleton, and Waunakee trust TotalGuard for expert <Link href="/services/mowing" className="text-primary hover:underline font-semibold">lawn mowing</Link>, <Link href="/services/garden-beds" className="text-primary hover:underline font-semibold">garden bed maintenance</Link>, <Link href="/services/weeding" className="text-primary hover:underline font-semibold">weeding services</Link>, and more. Learn more <Link href="/team" className="text-primary hover:underline font-semibold">about our team</Link> and see <Link href="/reviews" className="text-primary hover:underline font-semibold">what customers are saying</Link>.
                </p>
                <Button asChild variant="outline">
                  <Link href="/gallery">
                    View Our Work
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>

              <Card className="p-8 border-2">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Commercial property maintenance
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Business owners and property managers rely on TotalGuard for professional <Link href="/commercial/lawn-care" className="text-primary hover:underline font-semibold">commercial lawn care</Link>, <Link href="/commercial/gutters" className="text-primary hover:underline font-semibold">gutter maintenance</Link>, and <Link href="/commercial/seasonal" className="text-primary hover:underline font-semibold">seasonal services</Link> across all our service areas.
                </p>
                <Button asChild variant="outline">
                  <Link href="/commercial">
                    Commercial Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/30 px-6 py-3 rounded-full text-sm font-bold mb-6">
              <Star className="h-5 w-5 fill-current" />
              4.9 Stars on Google
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to transform your property?
            </h2>
            <p className="text-xl mb-10 opacity-95 leading-relaxed">
              Join hundreds of satisfied homeowners and businesses across Madison, Middleton, Waunakee, and surrounding areas. Get your free quote today — no obligation, just expert advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link href="/contact">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get a Free Quote
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8" asChild>
                <a href="tel:920-629-6934">
                  <Phone className="mr-2 h-5 w-5" />
                  (920) 629-6934
                </a>
              </Button>
            </div>
            <p className="text-sm opacity-80">
              Or explore our <Link href="/blog" className="underline hover:no-underline font-semibold">helpful lawn care tips</Link> and <Link href="/reviews" className="underline hover:no-underline font-semibold">customer reviews</Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
