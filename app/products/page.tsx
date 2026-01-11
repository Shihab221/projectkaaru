// Enable ISR (Incremental Static Regeneration)
// This will cache the page for 5 minutes and regenerate in the background
export const revalidate = 300; // 5 minutes

import { Suspense } from "react";
import { ProductsPageContent } from "@/components/products/ProductsPageContent";
import { ProductsPageSkeleton } from "@/components/products/ProductsPageSkeleton";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}
