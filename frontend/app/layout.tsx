import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { LoginModal } from "@/components/auth/LoginModal";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
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
          <Header />
          {children}
          <Footer />
          <MobileNav />
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
