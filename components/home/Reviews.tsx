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

  // Get visible reviews - 3 on mobile, 5 on desktop
  const getVisibleReviews = (isMobile: boolean) => {
    const visible = [];
    const range = isMobile ? 1 : 2; // Show 3 on mobile, 5 on desktop
    for (let i = -range; i <= range; i++) {
      const index = (currentIndex + i + reviews.length) % reviews.length;
      visible.push({
        ...reviews[index],
        position: i,
        isCenter: i === 0,
      });
    }
    return visible;
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Don't just take our word for it. See what our happy customers have to say about their 3D printed creations.
            </p>
          </motion.div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={nextReview}
            className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Mobile View - 3 images */}
          <div className="md:hidden">
            <div className="flex items-center justify-center min-h-[350px] px-12">
              <AnimatePresence mode="wait">
                <div className="flex items-center justify-center gap-2">
                  {getVisibleReviews(true).map((review) => (
                    <motion.div
                      key={`mobile-${review.id}-${currentIndex}`}
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                        x: review.position > 0 ? 50 : -50
                      }}
                      animate={{
                        opacity: review.isCenter ? 1 : 0.6,
                        scale: review.isCenter ? 1 : 0.75,
                        x: 0
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        x: review.position > 0 ? -50 : 50
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut"
                      }}
                      className={`relative rounded-xl overflow-hidden shadow-lg flex-shrink-0 ${
                        review.isCenter 
                          ? "w-40 h-56 z-10" 
                          : "w-24 h-36 z-0"
                      }`}
                    >
                      <Image
                        src={review.image}
                        alt={`Review from ${review.name}`}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                      {review.isCenter && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="absolute bottom-0 left-0 right-0 p-3 text-white"
                          >
                            <div className="flex items-center gap-0.5 mb-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <p className="text-xs font-medium">{review.name}</p>
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop View - 5 images */}
          <div className="hidden md:block">
            <div className="flex items-center justify-center min-h-[450px] lg:min-h-[550px] px-16">
              <AnimatePresence mode="wait">
                <div className="flex items-center justify-center gap-3 lg:gap-4">
                  {getVisibleReviews(false).map((review) => {
                    // Determine size based on position - portrait aspect ratio
                    let sizeClasses = "";
                    if (review.position === 0) {
                      sizeClasses = "w-52 h-72 lg:w-64 lg:h-96"; // Center - largest
                    } else if (Math.abs(review.position) === 1) {
                      sizeClasses = "w-40 h-56 lg:w-48 lg:h-72"; // Adjacent - medium
                    } else {
                      sizeClasses = "w-28 h-40 lg:w-36 lg:h-52"; // Far - smallest
                    }

                    return (
                      <motion.div
                        key={`desktop-${review.id}-${currentIndex}`}
                        initial={{
                          opacity: 0,
                          scale: 0.8,
                          x: review.position > 0 ? 100 : -100
                        }}
                        animate={{
                          opacity: review.isCenter ? 1 : 0.7 - Math.abs(review.position) * 0.1,
                          scale: review.isCenter ? 1 : 0.9 - Math.abs(review.position) * 0.05,
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
                        className={`relative rounded-xl overflow-hidden shadow-lg flex-shrink-0 ${sizeClasses} ${
                          review.isCenter ? "z-10" : Math.abs(review.position) === 1 ? "z-5" : "z-0"
                        }`}
                      >
                        <Image
                          src={review.image}
                          alt={`Review from ${review.name}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 200px, 256px"
                        />
                        {review.isCenter && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 md:mt-8 gap-1.5 md:gap-2 flex-wrap px-4">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 md:w-8 bg-primary"
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
          className="text-center mt-10 md:mt-12 px-4"
        >
          <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
            Join thousands of satisfied customers who trust us with their 3D printing needs.
          </p>
          <a
            href="/products"
            className="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base"
          >
            Start Your Project
            <ChevronRight className="w-4 h-4 ml-2" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
