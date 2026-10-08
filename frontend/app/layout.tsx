import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Airbnb Cereal isn't public; Inter is the closest freely available match.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airbnb Clone",
  description: "Vacation rentals, cabins, beach houses and more",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-ink">{children}</body>
    </html>
  );
}
