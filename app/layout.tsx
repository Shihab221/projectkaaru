import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "ProjectKaaru | Custom 3D Printed Products",
  description:
    "Custom 3D Printed Wonders - Home Decor, Keychains, Organizers & More. Quality 3D printing services in Bangladesh.",
  keywords: [
    "3D printing",
    "custom prints",
    "home decor",
    "keychains",
    "organizers",
    "Bangladesh",
    "ProjectKaaru",
  ],
  openGraph: {
    title: "ProjectKaaru | Custom 3D Printed Products",
    description: "Custom 3D Printed Wonders - Home Decor, Keychains, Organizers & More",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ReduxProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSidebar />
          <WhatsAppButton />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1a1a1a",
                color: "#fff",
                borderRadius: "8px",
              },
              success: {
                iconTheme: {
                  primary: "#00C853",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#FF1744",
                  secondary: "#fff",
                },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}

