"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { SOCIAL_LINKS, NAV_LINKS, APP_NAME } from "@/lib/constants";
import Image from "next/image";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Home Decor", href: "/products?category=home-decor" },
    { label: "Key Chains", href: "/products?category=key-chains" },
    { label: "Organizers", href: "/products?category=organizer" },
    { label: "On Sale", href: "/products?onSale=true" },
  ],
  company: [
    { label: "Contact", href: "/contact" },
    { label: "Custom Orders", href: "/custom" },
    { label: "FAQ", href: "/faq" },
  ],
  support: [
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Track Order", href: "/track" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
            <Image 
              src="/Logo Web.png"
              alt="ProjectKaru Logo"
              width={80}
              height={80}
            />
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              Custom 3D Printed Wonders - From home decor to personalized keychains, 
              we bring your ideas to life with precision and creativity.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <a
                href="mailto:hello@projectkaru.com"
                className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                hello@projectkaru.com
              </a>
              <a
                href="tel:+8801712345678"
                className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +880 1613-371875
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Khulna, Bangladesh</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ProjectKaru. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

