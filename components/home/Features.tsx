"use client";

import { motion } from "framer-motion";
import { Leaf, Truck, Palette, Shield, Clock, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Eco-Friendly Materials",
    description: "We use PLA and other biodegradable materials for sustainable printing.",
  },
  {
    icon: Palette,
    title: "Custom Designs",
    description: "Bring your ideas to life with our custom 3D printing service.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick processing and nationwide shipping across Bangladesh.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Premium finish and durability on every product we create.",
  },
  {
    icon: Clock,
    title: "Quick Turnaround",
    description: "Most orders ready within 3-5 business days.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Support",
    description: "Dedicated support team ready to help with your orders.",
  },
];

export function Features() {
  return (
    <section className="section bg-secondary text-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Why Choose ProjectKaaru?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-xl mx-auto"
          >
            We&apos;re passionate about bringing your ideas to life with precision
            3D printing
          </motion.p>
        </div>

        {/* Features Grid */}
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex items-start gap-4 p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

