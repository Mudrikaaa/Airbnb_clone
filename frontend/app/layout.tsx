import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HideOnCheckout } from "@/components/layout/HideOnCheckout";
import { MobileNav } from "@/components/layout/MobileNav";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

// Airbnb Cereal isn't public; Inter is the closest freely available match.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airbnb Clone | Holiday rentals, cabins, beach houses & more",
  description: "Vacation rentals, cabins, beach houses and more",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen font-sans text-ink">
        <AuthProvider>
          {/* Header and MobileNav read the pathname; on dynamic routes (/rooms/[id]) that's only
              known at request time, so Next.js needs a Suspense boundary around them. */}
          <Suspense fallback={<div aria-hidden className="h-20 border-b border-line-light" />}>
            <Header />
          </Suspense>
          {children}
          <Suspense fallback={null}>
            <HideOnCheckout>
              <Footer />
            </HideOnCheckout>
            <MobileNav />
          </Suspense>
          <LoginModal />
          {/* Airbnb shows toasts bottom-left as white cards */}
          <Toaster
            position="bottom-left"
            toastOptions={{
              className: "!rounded-xl !border-0 !shadow-panel !text-sm !font-medium !text-ink",
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
