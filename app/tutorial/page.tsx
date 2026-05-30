"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Youtube } from "lucide-react";

interface TutorialItem {
  id: string;
  title: string;
  shortDescription: string | null;
  youtubeUrl: string;
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string | null;
}

export default function TutorialPage() {
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/tutorials");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load tutorials");
        }
        if (!cancelled) {
          setTutorials(data.tutorials || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-14 md:py-20">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Tutorials
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            Watch our YouTube tutorials for tips, demos, and how-tos around our
            products and 3D printing.
          </motion.p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom">
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="card p-8 text-center text-red-600">{error}</div>
          )}

          {!loading && !error && tutorials.length === 0 && (
            <div className="card p-12 text-center text-gray-500">
              <p className="text-lg mb-2">No tutorials published yet.</p>
              <p className="text-sm">Check back soon for new videos.</p>
            </div>
          )}

          {!loading && !error && tutorials.length > 0 && (
            <div className="grid gap-10 md:gap-12">
              {tutorials.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.08, 0.4) }}
                  className="card overflow-hidden"
                >
                  <div className="grid lg:grid-cols-5 gap-0">
                    <div className="lg:col-span-3 bg-black aspect-video lg:aspect-auto lg:min-h-[280px] relative">
                      {item.embedUrl ? (
                        <iframe
                          title={item.title}
                          src={item.embedUrl}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        item.thumbnailUrl && (
                          <Image
                            src={item.thumbnailUrl}
                            alt=""
                            fill
                            className="object-cover opacity-80"
                          />
                        )
                      )}
                    </div>
                    <div className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-center">
                      <h2 className="text-xl md:text-2xl font-bold text-secondary mb-3">
                        {item.title}
                      </h2>
                      {item.shortDescription && (
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                          {item.shortDescription}
                        </p>
                      )}
                      <Link
                        href={item.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors w-fit"
                      >
                        <Youtube className="w-5 h-5" />
                        Watch on YouTube
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
