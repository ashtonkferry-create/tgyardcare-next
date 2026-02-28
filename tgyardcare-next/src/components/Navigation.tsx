'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, Phone, Sprout, Flower2, Calendar, Home, Snowflake, Scissors, SprayCan, Leaf, CircleDot, Trees, Trash2, Sparkles, CloudRain, Shield, ArrowRight, Users, Zap, Award, Droplets, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeasonalTheme } from "@/contexts/SeasonalThemeContext";
import { MobileNavMenu } from "@/components/MobileNavMenu";

// Optimized service names for SEO + conversion
// Service type definition
interface ServiceItem {
  name: string;
  path: string;
  icon: LucideIcon;
  featured?: boolean;
  winterOnly?: boolean;
}

// Revenue-prioritized service categories - SEO optimized names
const serviceCategories: {
  category: string;
  icon: LucideIcon;
  services: ServiceItem[];
}[] = [
  {
    category: "Lawn Care",
    icon: Sprout,
    services: [
      { name: "Lawn Mowing", path: "/services/mowing", icon: Scissors, featured: true },
      { name: "Fertilization", path: "/services/fertilization", icon: SprayCan },
      { name: "Aeration", path: "/services/aeration", icon: CircleDot },
      { name: "Weed Control", path: "/services/herbicide", icon: Leaf },
    ]
  },
  {
    category: "Landscaping",
    icon: Flower2,
    services: [
      { name: "Garden Beds", path: "/services/garden-beds", icon: Flower2 },
      { name: "Mulching", path: "/services/mulching", icon: Trees },
      { name: "Pruning", path: "/services/pruning", icon: Scissors },
      { name: "Weeding", path: "/services/weeding", icon: Leaf },
    ]
  },
  {
    category: "Seasonal",
    icon: Calendar,
    services: [
      { name: "Spring Cleanup", path: "/services/spring-cleanup", icon: Sparkles },
      { name: "Fall Cleanup", path: "/services/fall-cleanup", icon: CloudRain },
      { name: "Leaf Removal", path: "/services/leaf-removal", icon: Trash2 },
      { name: "Snow Removal", path: "/services/snow-removal", icon: Snowflake, winterOnly: true },
    ]
  },
  {
    category: "Gutters",
    icon: Droplets,
    services: [
      { name: "Gutter Cleaning", path: "/services/gutter-cleaning", icon: Home },
      { name: "Gutter Guards", path: "/services/gutter-guards", icon: Shield },
    ]
  }
];


// SEO-optimized commercial services names
const baseCommercialServices = [{
  name: "Lawn Maintenance",
  path: "/commercial/lawn-care"
}, {
  name: "Seasonal Cleanup",
  path: "/commercial/seasonal"
}, {
  name: "Gutter Services",
  path: "/commercial/gutters"
}, {
  name: "Property Enhancement",
  path: "/commercial/property-enhancement"
}, {
  name: "Fertilization & Weed Control",
  path: "/commercial/fertilization-weed-control"
}, {
  name: "Aeration",
  path: "/commercial/aeration"
}];

// Commercial Snow Removal - ONLY shown in winter
const commercialSnowRemovalService = {
  name: "Commercial Snow Removal",
  path: "/commercial/snow-removal",
  winterOnly: true
};

const aboutPages = [{
  name: "About Us",
  path: "/about"
}, {
  name: "Meet Our Team",
  path: "/team"
}, {
  name: "Service Areas",
  path: "/service-areas"
}, {
  name: "FAQ",
  path: "/faq"
}, {
  name: "Blog",
  path: "/blog"
}, {
  name: "Careers",
  path: "/careers"
}];

// Trust indicators
const trustIndicators = [
  { icon: Shield, label: "Licensed & Insured" },
  { icon: Users, label: "Local Madison Team" },
  { icon: Zap, label: "Fast Quotes" },
  { icon: Award, label: "Top-Rated Reviews" },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [residentialOpen, setResidentialOpen] = useState(false);
  const [commercialOpen, setCommercialOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const pathname = usePathname();

  // Get active season from context to conditionally show winter overlay
  const { activeSeason } = useSeasonalTheme();
  const isWinterSeason = activeSeason === 'winter';

  // Build commercial services list - Commercial Snow Removal ONLY in winter
  const commercialServices = isWinterSeason
    ? [...baseCommercialServices.slice(0, 2), commercialSnowRemovalService, ...baseCommercialServices.slice(2)]
    : baseCommercialServices;

  // Check if a path is active
  const isActivePath = (path: string) => pathname === path;


  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm nav-seasonal">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              alt="TotalGuard Yard Care - Professional Lawn Care Services in Madison Wisconsin"
              src="/lovable-uploads/8efd3e68-ac8f-4cef-82a1-dd4465a3bf17.png"
              className="h-10 w-10 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full hover:scale-110 transition-transform duration-300"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-foreground tracking-tight">TOTALGUARD</span>
              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-primary tracking-wide">YARD CARE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* PREMIUM MEGA MENU - Home Services */}
            <div
              className="relative"
              onMouseEnter={() => setResidentialOpen(true)}
              onMouseLeave={() => setResidentialOpen(false)}
            >
              <button className="flex items-center text-foreground hover:text-primary transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg hover:bg-primary/5">
                Residential Services <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform duration-200 ${residentialOpen ? 'rotate-180' : ''}`} />
              </button>

              {residentialOpen && (
                <div className="absolute top-full left-0 pt-2 z-[100]">
                  {/* Dark Mega Menu matching other dropdowns */}
                  <div className="w-[620px] bg-gradient-to-br from-[#1a1a1a] via-[#222222] to-[#1a1a1a] rounded-xl shadow-2xl border border-primary/20 overflow-hidden animate-fade-in">
                    {/* Animated gradient bar */}
                    <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />

                    {/* Seasonal floating particles - smooth drifting animation */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {activeSeason === 'winter' ? (
                        <>
                          <Snowflake className="absolute top-[10%] left-[10%] w-4 h-4 text-sky-300/40 animate-drift-1" />
                          <Snowflake className="absolute top-[20%] right-[15%] w-3 h-3 text-sky-200/30 animate-drift-2" />
                          <Snowflake className="absolute bottom-[25%] left-[30%] w-4 h-4 text-sky-300/35 animate-drift-3" />
                          <Snowflake className="absolute top-[40%] left-[55%] w-2.5 h-2.5 text-sky-200/25 animate-drift-1" style={{ animationDelay: '-3s' }} />
                          <Snowflake className="absolute bottom-[35%] right-[25%] w-3 h-3 text-sky-300/30 animate-drift-2" style={{ animationDelay: '-5s' }} />
                          <Snowflake className="absolute top-[15%] right-[40%] w-3.5 h-3.5 text-sky-200/35 animate-drift-3" style={{ animationDelay: '-7s' }} />
                        </>
                      ) : activeSeason === 'fall' ? (
                        <>
                          <Leaf className="absolute top-[10%] left-[10%] w-4 h-4 text-orange-400/40 animate-drift-1" />
                          <Leaf className="absolute top-[20%] right-[15%] w-3 h-3 text-amber-500/30 animate-drift-2" />
                          <Leaf className="absolute bottom-[25%] left-[30%] w-4 h-4 text-orange-300/35 animate-drift-3" />
                          <Leaf className="absolute top-[40%] left-[55%] w-2.5 h-2.5 text-amber-400/25 animate-drift-1" style={{ animationDelay: '-3s' }} />
                          <Leaf className="absolute bottom-[35%] right-[25%] w-3 h-3 text-orange-500/30 animate-drift-2" style={{ animationDelay: '-5s' }} />
                          <Leaf className="absolute top-[15%] right-[40%] w-3.5 h-3.5 text-amber-300/35 animate-drift-3" style={{ animationDelay: '-7s' }} />
                        </>
                      ) : (
                        <>
                          <Flower2 className="absolute top-[10%] left-[10%] w-4 h-4 text-primary/40 animate-drift-1" />
                          <Sparkles className="absolute top-[20%] right-[15%] w-3 h-3 text-yellow-400/30 animate-drift-2" />
                          <Flower2 className="absolute bottom-[25%] left-[30%] w-4 h-4 text-primary/35 animate-drift-3" />
                          <Sparkles className="absolute top-[40%] left-[55%] w-2.5 h-2.5 text-yellow-300/25 animate-drift-1" style={{ animationDelay: '-3s' }} />
                          <Flower2 className="absolute bottom-[35%] right-[25%] w-3 h-3 text-primary/30 animate-drift-2" style={{ animationDelay: '-5s' }} />
                          <Sparkles className="absolute top-[15%] right-[40%] w-3.5 h-3.5 text-yellow-400/35 animate-drift-3" style={{ animationDelay: '-7s' }} />
                        </>
                      )}
                    </div>

                    <div className="p-6 relative">
                      {/* Services Grid - 4 columns */}
                      <div className="grid grid-cols-4 gap-8">
                        {serviceCategories.map((category) => {
                          const CategoryIcon = category.icon;
                          const filteredServices = category.services.filter(s => !s.winterOnly || isWinterSeason);

                          return (
                            <div key={category.category} className="space-y-3">
                              <div className="flex items-center gap-2 pb-2.5 border-b border-white/20">
                                <div className="p-1.5 bg-white/10 rounded-lg">
                                  <CategoryIcon className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-white tracking-tight">{category.category}</span>
                              </div>
                              <div className="space-y-1">
                                {filteredServices.map((service, idx) => {
                                  const isSnowService = service.winterOnly && isWinterSeason;
                                  const isActive = isActivePath(service.path);
                                  const ServiceIcon = service.icon;

                                  return (
                                    <Link
                                      key={service.path + idx}
                                      href={service.path}
                                      className={`group flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg transition-all duration-200 ${
                                        isActive
                                          ? 'bg-primary/20 text-primary font-semibold'
                                          : 'hover:bg-white/10 hover:translate-x-1'
                                      }`}
                                    >
                                      <ServiceIcon className={`h-3.5 w-3.5 transition-colors ${
                                        isActive ? 'text-primary' :
                                        isSnowService ? 'text-sky-400' :
                                        'text-white/60 group-hover:text-primary'
                                      }`} />
                                      <span className={`text-sm transition-colors ${
                                        isActive ? 'text-primary font-semibold' :
                                        service.featured ? 'font-medium text-white group-hover:text-primary' :
                                        isSnowService ? 'text-sky-400 font-medium' :
                                        'text-white/80 group-hover:text-white'
                                      }`}>
                                        {service.name}
                                      </span>
                                      {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom CTA with refined styling */}
                      <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          {trustIndicators.slice(0, 3).map((item) => {
                            const TrustIcon = item.icon;
                            return (
                              <div key={item.label} className="flex items-center gap-2 group/trust">
                                <div className="p-1 bg-white/10 rounded group-hover/trust:bg-primary/20 transition-colors">
                                  <TrustIcon className="h-3 w-3 text-white/60 group-hover/trust:text-primary transition-colors" />
                                </div>
                                <span className="text-xs text-white/60 group-hover/trust:text-white transition-colors">{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                        <Link
                          href="/contact"
                          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 hover:scale-105 transition-all shadow-lg hover:shadow-primary/25"
                        >
                          Get Quote <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Commercial Services Dropdown */}
            <div className="relative" onMouseEnter={() => setCommercialOpen(true)} onMouseLeave={() => setCommercialOpen(false)}>
              <button className="flex items-center text-foreground hover:text-primary hover:bg-primary/10 transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg">
                Commercial Services <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${commercialOpen ? 'rotate-180' : ''}`} />
              </button>
              {commercialOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-72 bg-gradient-to-br from-[#1a1a1a] via-[#222222] to-[#1a1a1a] rounded-xl shadow-2xl border border-primary/20 overflow-hidden animate-fade-in">
                    <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
                    <div className="p-2">
                      {commercialServices.map(service => {
                        const isSnowRemoval = service.name === "Commercial Snow Removal";
                        const showWinterOverlay = isSnowRemoval && isWinterSeason;
                        return (
                          <Link
                            key={service.path}
                            href={service.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                              showWinterOverlay
                                ? 'bg-gradient-to-r from-sky-900/40 to-blue-900/30 border border-sky-500/30 hover:border-sky-400/50 my-1'
                                : 'text-white hover:bg-white/10'
                            }`}
                          >
                            {showWinterOverlay ? (
                              <span className="flex items-center gap-2 text-white font-medium">
                                <Snowflake className="h-4 w-4 text-sky-300" />
                                <span className="text-sm">{service.name}</span>
                                <span className="ml-auto text-[9px] bg-sky-500/30 text-sky-200 px-1.5 py-0.5 rounded-full font-semibold">WINTER</span>
                              </span>
                            ) : (
                              <span className="text-sm text-white/90">{service.name}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/gallery" className="text-foreground hover:text-primary hover:bg-primary/10 transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg">
              Portfolio
            </Link>

            {/* About Dropdown */}
            <div className="relative" onMouseEnter={() => setAboutOpen(true)} onMouseLeave={() => setAboutOpen(false)}>
              <button className="flex items-center text-foreground hover:text-primary hover:bg-primary/10 transition-all font-semibold text-sm tracking-wide px-4 py-2 rounded-lg">
                About Us <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${aboutOpen ? 'rotate-180' : ''}`} />
              </button>
              {aboutOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-56 bg-gradient-to-br from-[#1a1a1a] via-[#222222] to-[#1a1a1a] rounded-xl shadow-2xl border border-primary/20 overflow-hidden animate-fade-in">
                    <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
                    <div className="p-2">
                      {aboutPages.map(page => (
                        <Link
                          key={page.path}
                          href={page.path}
                          className="block px-3 py-2.5 text-sm text-white/90 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            <a href="tel:608-535-6057" className="flex items-center text-foreground hover:text-primary transition-colors font-bold text-sm xl:text-base group">
              <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-all mr-2">
                <Phone className="h-4 w-4 xl:h-5 xl:w-5 text-primary" />
              </div>
              <span className="hidden xl:inline">(608) 535-6057</span>
            </a>
            <Button variant="accent" size="lg" className="font-bold text-sm xl:text-base px-4 xl:px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all" asChild>
              <Link href="/contact">Get a Free Quote →</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            <a href="tel:608-535-6057" className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-all tap-target flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </a>
            <button className="p-2.5 text-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg tap-target flex items-center justify-center" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Premium Mobile Menu */}
        <MobileNavMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>
    </nav>
  );
}
