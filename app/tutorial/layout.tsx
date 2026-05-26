import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutorials",
  description:
    "YouTube tutorials and guides from ProjectKaru — 3D printing tips, product demos, and how-tos.",
};

export default function TutorialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
