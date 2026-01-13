"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// Generate review images array from 1 to 18
const reviews = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  image: `/reviews/${i + 1}.jpg`,
  name: `Customer ${i + 1}`,
  rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5 stars
}));

export function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };


  // Get visible reviews (center + 2 on each side = 5 total)
  const getVisibleReviews = () => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + reviews.length) % reviews.length;
      visible.push({
        ...reviews[index],
        position: i,
        isCenter: i === 0,
      });
    }
    return visible;
  };

  const visibleReviews = getVisibleReviews();

  // Get size classes based on position
  const getSizeClasses = (position: number) => {
    if (position === 0) {
      // Center - largest
      return "w-64 h-48 md:w-80 md:h-60 lg:w-96 lg:h-72";
    } else if (Math.abs(position) === 1) {
      // Immediate left/right - medium
      return "w-48 h-36 md:w-64 md:h-48 lg:w-72 lg:h-54";
    } else {
      // Far left/right - smallest
      return "w-32 h-24 md:w-48 md:h-36 lg:w-56 lg:h-42";
    }
  };

  const getOpacityClasses = (position: number) => {
    if (position === 0) return "opacity-100";
    if (Math.abs(position) === 1) return "opacity-80";
    return "opacity-60";
  };

  const getTransformClasses = (position: number) => {
    if (position === 0) return "scale-100 z-10";
    if (Math.abs(position) === 1) return "scale-90 z-5";
    return "scale-75 z-0";
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. See what our happy customers have to say about their 3D printed creations.
            </p>
          </motion.div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextReview}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
            aria-label="Next review"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Reviews Display */}
          <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px] lg:min-h-[500px] px-16">
            <AnimatePresence mode="wait">
              <div className="flex items-center justify-center gap-2 md:gap-3 lg:gap-4">
                {visibleReviews.map((review, index) => (
                  <motion.div
                    key={`${review.id}-${currentIndex}`}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      x: review.position > 0 ? 100 : -100
                    }}
                    animate={{
                      opacity: review.isCenter ? 1 : 0.8 - Math.abs(review.position) * 0.1,
                      scale: review.isCenter ? 1 : 0.9 - Math.abs(review.position) * 0.1,
                      x: 0
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      x: review.position > 0 ? -100 : 100
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut"
                    }}
                    className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                      getSizeClasses(review.position)
                    } ${getOpacityClasses(review.position)} ${getTransformClasses(review.position)}`}
                  >
                    {/* Review Image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={review.image}
                        alt={`Review from ${review.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Overlay for center review */}
                      {review.isCenter && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      )}
                    </div>

                    {/* Review Details - Only show for center */}
                    {review.isCenter && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="absolute bottom-0 left-0 right-0 p-4 text-white"
                      >
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm font-medium">{review.name}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            Join thousands of satisfied customers who trust us with their 3D printing needs.
          </p>
          <a
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Start Your Project
            <ChevronRight className="w-4 h-4 ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
