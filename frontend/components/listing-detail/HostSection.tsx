"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { SuperhostBadge } from "@/components/listing-detail/Overview";
import { Avatar } from "@/components/ui/Avatar";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
import { GreyButton } from "@/components/ui/GreyButton";
import { formatRating, timeOnAirbnb } from "@/lib/format";
import type { Host } from "@/lib/types";

/**
 * "Meet your host" — card measured on airbnb.com: 395px wide, 24px radius, 24px/16px padding,
 * pill shadow, 88px avatar, ~32px/600 name, stats at 22px/600 with 10px/500 labels.
 */
export function HostSection({ host }: { host: Host }) {
  const [messageOpen, setMessageOpen] = useState(false);
  const firstName = host.name.split(" ")[0];
  const hosting = timeOnAirbnb(host.joined_at);

  const stats = [
    { value: String(host.review_count), label: "Reviews" },
    ...(host.average_rating !== null ? [{ value: formatRating(host.average_rating), label: "Rating", star: true }] : []),
    { value: String(hosting.value), label: `${hosting.unit === "year" || hosting.unit === "years" ? "Years" : "Months"} hosting` },
  ];

  return (
    <section className="py-12">
      <h2 className="text-heading font-medium">Meet your host</h2>
      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="lg:w-[395px] lg:shrink-0">
          <div className="grid grid-cols-[1fr_auto] items-center rounded-3xl bg-white px-4 py-6 shadow-pill">
            <div className="flex flex-col items-center px-4 text-center">
              <span className="relative">
                <Avatar user={host} size={88} />
                {host.is_superhost && <SuperhostBadge size={28} className="absolute -bottom-0.5 -right-0.5" />}
              </span>
              <span className="mt-2 text-[32px] font-semibold leading-9">{firstName}</span>
              <span className="text-xs font-medium text-muted">{host.is_superhost ? "Superhost" : "Host"}</span>
            </div>
            <dl className="w-28 divide-y divide-line pr-4">
              {stats.map((s) => (
                <div key={s.label} className="py-3 first:pt-0 last:pb-0">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="flex items-center gap-0.5 text-[22px] font-semibold leading-[26px]">
                    {s.value}
                    {"star" in s && <Star size={12} fill="currentColor" strokeWidth={0} />}
                  </dd>
                  <dd className="text-[10px] font-medium leading-[14px]">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          {host.bio && <p className="mt-8 text-base leading-6">{host.bio}</p>}
        </div>

        <div className="flex-1">
          {host.is_superhost && (
            <>
              <h3 className="text-lg font-medium">{firstName} is a Superhost</h3>
              <p className="mt-4 text-base leading-6">
                Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
              </p>
            </>
          )}
          <h3 className={`text-lg font-medium ${host.is_superhost ? "mt-8" : ""}`}>Host details</h3>
          <p className="mt-4 text-base leading-6">
            Hosting {host.listing_count} {host.listing_count === 1 ? "place" : "places"} on Airbnb
          </p>
          <GreyButton onClick={() => setMessageOpen(true)} className="mt-8">
            Message host
          </GreyButton>
          <p className="mt-8 flex items-center gap-3 border-t border-line pt-8 text-xs text-muted">
            To help protect your payment, always use Airbnb to send money and communicate with hosts.
          </p>
        </div>
      </div>
      <ComingSoonModal open={messageOpen} onClose={() => setMessageOpen(false)} feature="Messaging" />
    </section>
  );
}
