"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const faqs = [
  {
    question: "What is Project Karu?",
    answer:
      "Project Karu is a Bangladesh-based custom 3D printing business. We specialize in personalized name keychains, home décor pieces, and collectibles inspired by anime and games.",
  },
  {
    question: "What products do you offer?",
    answer:
      "We offer custom name keychains, decorative home pieces, and anime and gaming collectibles. Most of our products can be personalized to your preference.",
  },
  {
    question: "How do I place an order?",
    answer:
      "You can place your order by contacting us directly through our Instagram page or website. Share your customization details such as name, color, and design preference and we will take it from there.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery within Dhaka takes 3 to 5 business days. For all other districts outside Dhaka, delivery takes 4 to 7 business days from the date your order is confirmed and dispatched.",
  },
  {
    question: "Can I choose the color of my product?",
    answer:
      "Yes, most products are available in multiple colors. You can mention your preferred color when placing your order.",
  },
  {
    question: "What if my order arrives damaged or incorrect?",
    answer:
      "We will exchange your product if it arrives broken, cracked, in the wrong color combination, or with a spelling error. To be eligible, you must record an unboxing video at the time of delivery and contact us within 24 hours of receiving the parcel.",
  },
  {
    question: "Is an unboxing video really necessary?",
    answer:
      "Yes, it is mandatory. The video must be recorded before and throughout the unboxing without pausing. Without a valid unboxing video, we are unable to process any exchange claim.",
  },
  {
    question: "Do you accept returns for change of mind?",
    answer:
      "No, we do not accept returns for change of mind or personal preference after delivery. Exchanges are only applicable for the reasons mentioned in our return policy.",
  },
  {
    question: "How long does it take to make my order?",
    answer:
      "Production time varies depending on the complexity of your order. We will give you an estimated production time when you confirm your order.",
  },
  {
    question: "Can I order in bulk for events or gifting?",
    answer:
      "Yes, we welcome bulk orders for occasions like weddings, birthdays, corporate events, and more. Contact us to discuss your requirements and we will be happy to help.",
  },
  {
    question: "How can I contact you?",
    answer:
      "You can reach us through our Instagram page at @projectkaru or via the contact form on our website. We typically respond within 24 hours.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/90 max-w-2xl"
          >
            Answers to common questions about ordering, delivery, and our products.
          </motion.p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-secondary pr-2">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          <p className="text-sm text-gray-500 text-center pt-6">
            Read our full{" "}
            <Link href="/returns" className="text-primary font-medium hover:underline">
              Returns & Exchange Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
