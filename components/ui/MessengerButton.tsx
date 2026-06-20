"use client";

import { motion } from "framer-motion";

const MESSENGER_LINK = "https://m.me/projectkaru2025";

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242A10.9 10.9 0 0012 22.222c6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
    </svg>
  );
}

export function MessengerButton() {
  return (
    <motion.a
      href={MESSENGER_LINK}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#0084FF] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0073E6] transition-colors"
      aria-label="Chat on Messenger"
    >
      <MessengerIcon className="w-7 h-7" />

      <span className="hidden md:block absolute w-full h-full rounded-full bg-[#0084FF] animate-ping opacity-30" />
    </motion.a>
  );
}
