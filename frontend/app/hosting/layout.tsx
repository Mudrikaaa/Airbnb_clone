import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { HostScroller } from "@/components/layout/HostScroller";

// Hosting pages put their footer inside their own scroll area (see HostScroller), so the
// root layout's footer is hidden for them (lib/chrome.ts).
export default function HostingLayout({ children }: LayoutProps<"/hosting">) {
  return (
    <Suspense fallback={children}>
      <HostScroller footer={<Footer />}>{children}</HostScroller>
    </Suspense>
  );
}
