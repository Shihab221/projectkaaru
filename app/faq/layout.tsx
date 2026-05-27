import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Project Karu",
  description:
    "Frequently asked questions about Project Karu orders, delivery, customization, and returns.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
