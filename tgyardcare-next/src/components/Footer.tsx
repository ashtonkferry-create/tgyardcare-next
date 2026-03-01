'use client';

import Link from "next/link";
import { Phone, Mail, MapPin, Snowflake, Leaf, Sun, CloudRain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeasonalTheme, Season } from "@/contexts/SeasonalThemeContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { activeSeason, seasonBadge } = useSeasonalTheme();

  const seasonIcons: Record<Season, typeof Leaf> = {
    summer: Sun,
    fall: CloudRain,
    winter: Snowflake,
  };

  const seasonMessages: Record<Season, string> = {
    summer: "☀️ Keep your lawn pristine all summer.",
    fall: "🍂 Fall cleanup slots filling fast!",
    winter: "❄️ Snow contracts available - book now!",
  };

  const SeasonIcon = seasonIcons[activeSeason];

  return <footer className="bg-slate-900 border-t border-slate-800 pb-24 lg:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center mb-4 group">
              <img
                alt="TotalGuard Yard Care - Madison's Premier Lawn Care Service"
                className="h-28 md:h-36 w-auto group-hover:scale-105 transition-transform"
                src="/images/totalguard-logo-full.png"
                loading="lazy"
              />
            </Link>
            <p className="text-slate-400 mb-3 text-sm">
              Madison's reliability-first lawn care company. Serving homeowners across Dane County since day one.
            </p>
            <p className="text-slate-500 text-xs mb-4">
              Proudly serving Madison, Middleton, Waunakee, Sun Prairie, Monona, Fitchburg, Verona, McFarland, DeForest, Cottage Grove, Oregon & Stoughton.
            </p>

            {/* Seasonal Message */}
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-2 rounded-lg mb-4 text-sm font-medium border border-blue-500/20">
              <SeasonIcon className="h-4 w-4 flex-shrink-0" />
              <span>{seasonMessages[activeSeason]}</span>
            </div>

            <div className="flex space-x-4">
              <a href="https://facebook.com/totalguardyardcare" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Follow TotalGuard Yard Care on Facebook">
                <img
                  alt="Follow us on Facebook for lawn care tips and special offers"
                  className="h-8 w-8"
                  loading="lazy"
                  src="/lovable-uploads/a2985d40-e463-4243-b26d-149a047426fb.png"
                  width="32"
                  height="32"
                />
              </a>
              <a href="https://www.instagram.com/tgyardcare/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Follow TotalGuard Yard Care on Instagram">
                <img
                  alt="Follow us on Instagram for lawn care transformations and updates"
                  className="h-8 w-8"
                  loading="lazy"
                  src="/lovable-uploads/0d24ae3b-c2eb-4565-a7ce-f97959422e02.png"
                  width="32"
                  height="32"
                />
              </a>
            </div>
          </div>

          {/* Residential Services */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4">Residential Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services" className="text-slate-400 hover:text-blue-400 transition-colors font-semibold">
                  All Services →
                </Link>
              </li>
              <li>
                <Link href="/services/mowing" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Lawn Mowing
                </Link>
              </li>
              <li>
                <Link href="/services/herbicide" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Herbicide Services
                </Link>
              </li>
              <li>
                <Link href="/services/fertilization" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Fertilization & Overseeding
                </Link>
              </li>
              <li>
                <Link href="/services/weeding" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Weeding
                </Link>
              </li>
              <li>
                <Link href="/services/mulching" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Mulching
                </Link>
              </li>
              <li>
                <Link href="/services/garden-beds" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Garden Bed Makeovers
                </Link>
              </li>
            </ul>
          </div>

          {/* Seasonal & Gutters */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4">Seasonal & Gutters</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/spring-cleanup" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Spring Cleanup
                </Link>
              </li>
              <li>
                <Link href="/services/fall-cleanup" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Fall Cleanup
                </Link>
              </li>
              <li>
                <Link href="/services/leaf-removal" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Leaf Removal
                </Link>
              </li>
              <li>
                <Link href="/services/gutter-cleaning" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Gutter Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services/gutter-guards" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Gutter Guard Installation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Meet Our Team
                </Link>
              </li>
              <li>
                <Link href="/residential" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Residential Services
                </Link>
              </li>
              <li>
                <Link href="/commercial" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Commercial Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-blue-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Blog & Tips
                </Link>
              </li>
              <li>
                <Link href="/service-areas" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Service Areas
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-slate-400 hover:text-blue-400 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4">Contact TotalGuard</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <Phone className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <a href="tel:608-535-6057" className="text-slate-400 hover:text-blue-400 transition-colors">
                  (608) 535-6057
                </a>
              </li>
              <li className="flex items-start">
                <Mail className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <a href="mailto:totalguardllc@gmail.com" className="text-slate-400 hover:text-blue-400 transition-colors break-all">
                  totalguardllc@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">
                  Serving All of Dane County
                  <br />Madison, WI & Surrounding Cities
                </span>
              </li>
            </ul>
            <Link href="/contact" className="inline-block mt-4">
              <Button variant="accent" size="sm" className="w-full">
                Get a free quote
              </Button>
            </Link>
          </div>
        </div>

        {/* Service Areas Banner */}
        <div className="border-t border-slate-800 mt-8 pt-6">
          <p className="text-center text-xs text-slate-500 mb-4">
            <strong className="text-slate-400">Service Areas:</strong> Madison • Middleton • Waunakee • Sun Prairie • Monona • Fitchburg • Verona • McFarland • DeForest • Cottage Grove • Oregon • Stoughton
          </p>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          <p>&copy; {currentYear} TotalGuard Yard Care LLC. All rights reserved. | Madison, Wisconsin</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>;
}
