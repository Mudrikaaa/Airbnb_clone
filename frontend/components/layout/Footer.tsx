import { Globe } from "lucide-react";

// Same structure as airbnb.com's footer (14px links, 500-weight headings, #F7F7F7 background).
// Links are placeholders — these pages are out of scope for the clone.
const COLUMNS = [
  {
    title: "Support",
    links: ["Help Centre", "Get help with a safety issue", "AirCover", "Anti-discrimination", "Disability support", "Cancellation options", "Report neighbourhood concern"],
  },
  {
    title: "Hosting",
    links: ["Airbnb your home", "Airbnb your experience", "Airbnb your service", "AirCover for Hosts", "Hosting resources", "Community forum", "Hosting responsibly", "Join a free hosting class", "Find a co-host"],
  },
  {
    title: "Airbnb",
    links: ["2026 Summer Release", "Newsroom", "Careers", "Investors", "Airbnb.org emergency stays"],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-subtle pb-16 md:pb-0">
      <div className="px-6 md:px-10 xl:px-12">
        <div className="grid gap-0 py-12 md:grid-cols-3 md:gap-6">
          {COLUMNS.map((col, i) => (
            <section key={col.title} className={`py-6 md:py-0 ${i > 0 ? "border-t border-line md:border-t-0" : ""}`}>
              <h3 className="text-sm font-medium">{col.title}</h3>
              <ul className="mt-4 space-y-4 text-sm">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-line py-6 text-sm md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-2">
            <span>© 2026 Airbnb Clone — a demo project</span>
            <span aria-hidden>·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span aria-hidden>·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span aria-hidden>·</span>
            <a href="#" className="hover:underline">Company details</a>
          </p>
          <div className="flex items-center gap-6 font-medium">
            <span className="flex items-center gap-2">
              <Globe size={16} strokeWidth={2} /> English (IN)
            </span>
            <span>₹ INR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
