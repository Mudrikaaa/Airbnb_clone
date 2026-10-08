import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = { title: "Wishlists - Airbnb Clone" };

export default function WishlistsPage() {
  return <WishlistView />;
}
