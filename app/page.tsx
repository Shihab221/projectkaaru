import { Hero } from "@/components/home/Hero";
import { TopProducts } from "@/components/home/TopProducts";
import { Categories } from "@/components/home/Categories";
import { Features } from "@/components/home/Features";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <TopProducts />
      <Features />
    </>
  );
}

