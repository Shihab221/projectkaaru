"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PolicyPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function PolicyPageLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: PolicyPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-12 md:py-16">
        <div className="container-custom">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/90 max-w-2xl"
            >
              {subtitle}
            </motion.p>
          )}
          {lastUpdated && (
            <p className="text-sm text-white/70 mt-3">Last updated: {lastUpdated}</p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6 md:p-10 prose-policy space-y-8 text-gray-700 leading-relaxed"
          >
            {children}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-secondary mb-3">{title}</h2>
      <div className="space-y-3 text-sm md:text-base">{children}</div>
    </section>
  );
}
