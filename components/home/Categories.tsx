"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Home, Key, FolderOpen, Package, Percent, Star, ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Beautiful pieces for your space",
    icon: Home,
    color: "bg-blue-500",
  },
  {
    name: "Key Chains",
    slug: "key-chains",
    description: "Personalized & colorful",
    icon: Key,
    color: "bg-purple-500",
  },
  {
    name: "Organizers",
    slug: "organizer",
    description: "Neat & functional designs",
    icon: FolderOpen,
    color: "bg-green-500",
  },
  {
    name: "Others",
    slug: "others",
    description: "Unique 3D printed items",
    icon: Package,
    color: "bg-orange-500",
  },
  {
    name: "On Sale",
    slug: "on-sale",
    description: "Great deals await",
    icon: Percent,
    color: "bg-primary",
    isSpecial: true,
  },
  {
    name: "Top Products",
    slug: "top-products",
    description: "Best sellers & favorites",
    icon: Star,
    color: "bg-yellow-500",
    isSpecial: true,
  },
];

export function Categories() {
  return (
    <section className="section">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-subtitle mx-auto max-w-xl"
          >
            Explore our wide range of 3D printed products
          </motion.p>
        </div>

        {/* Categories Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((category) => (
            <motion.div
              key={category.slug}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                href={
                  category.isSpecial && category.slug === "on-sale"
                    ? "/products?onSale=true"
                    : category.isSpecial && category.slug === "top-products"
                    ? "/products?isTopProduct=true"
                    : `/products?category=${category.slug}`
                }
                className="card card-hover p-4 md:p-6 text-center group block"
              >
                <div
                  className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-secondary mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500">{category.description}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

