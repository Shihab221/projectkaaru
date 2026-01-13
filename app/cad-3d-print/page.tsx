"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Truck,
  Clock,
  MessageCircle,
  Award,
  Star,
  Zap
} from "lucide-react";

export default function Cad3dPrintPage() {
  const filaments = [
    "PLA",
    "PLA+",
    "Silk PLA",
    "PETG",
    "ABS",
    "TPU",
    "ASA",
    "Wood PLA",
    "Marble PLA",
    "PLA CF, PA CF",
    "PA CF",
    "PETG CF, PETG CF"
  ];

  const nozzleSizes = [".2mm", ".4mm", ".6mm"];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with 3-Column Layout */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

          {/* Left Column - Available Filaments */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-secondary mb-4">
                Available Filaments
              </h2>
              <div className="space-y-2">
                {filaments.slice(0, 9).map((filament, index) => (
                  <div key={filament} className="flex items-center gap-2">
                    <span className="text-primary">🎯</span>
                    <span className="text-secondary">{filament}</span>
                  </div>
                ))}
                {filaments.slice(9).map((filament, index) => (
                  <div key={filament} className="flex items-center gap-2">
                    <span className="text-green-500">⚡</span>
                    <span className="text-secondary">{filament}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Middle Column - CAD Image */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src="/cad.png"
                alt="CAD Design Preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </motion.div>

          {/* Right Column - Service Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-secondary mb-4">
                FDM 3D Printing
              </h2>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-secondary">Smooth Surface Finish</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-secondary">Super Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span className="text-secondary">Free Delivery for orders above 2 KG</span>
                </div>
              </div>

              {/* Nozzle Sizes */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-secondary mb-2">
                  Nozzle Sizes Available:
                </h3>
                <div className="flex gap-2">
                  {nozzleSizes.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Button */}
              <div className="space-y-4">
                <p className="text-secondary font-medium">Quote now - Contact us</p>
                <Link
                  href="https://wa.me/8801613371875?text=Hi,%20I%20want%20to%20get%20a%20quote%20for%203D%20printing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mechanical Design Engineer Section */}
      <div className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column - Akib Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full max-w-md mx-auto aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src="/akib.jpg"
                  alt="Akib - Mechanical Design Engineer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </motion.div>

            {/* Right Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-4">
                  Mechanical Design Engineer
                </h2>

                <div className="space-y-4 text-secondary">
                  <p className="text-lg">
                    Hello, I'm <span className="font-semibold text-primary">Akib</span>, a certified SolidWorks Professional in CAD design
                    and winner of multiple CAD contests, hackathons and business
                    case competitions.
                  </p>

                  <p className="text-lg">
                    With over three years of experience, I specialize
                    in providing 3D mechanical design, design for 3D printing,
                    simulation, technical drawings, realistic rendering and animation.
                  </p>
                </div>

                {/* Certifications */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-secondary mb-4">
                    Certifications & Achievements
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Certification Icons */}
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                      <Award className="w-8 h-8 text-primary mb-2" />
                      <span className="text-sm font-medium text-center">SolidWorks Pro</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                      <Star className="w-8 h-8 text-yellow-500 mb-2" />
                      <span className="text-sm font-medium text-center">CAD Contest Winner</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                      <Award className="w-8 h-8 text-blue-500 mb-2" />
                      <span className="text-sm font-medium text-center">Hackathon Winner</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                      <Award className="w-8 h-8 text-green-500 mb-2" />
                      <span className="text-sm font-medium text-center">3D Design Expert</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                      <Star className="w-8 h-8 text-purple-500 mb-2" />
                      <span className="text-sm font-medium text-center">Simulation Pro</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                      <Award className="w-8 h-8 text-orange-500 mb-2" />
                      <span className="text-sm font-medium text-center">Rendering Expert</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}