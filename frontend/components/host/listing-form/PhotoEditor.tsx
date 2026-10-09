"use client";

import { ArrowLeft, ArrowRight, ImageOff, X } from "lucide-react";
import { useState } from "react";
import { ErrorText } from "@/components/host/listing-form/FormParts";
import { LIMITS, isHttpUrl } from "@/components/host/listing-form/form-state";

type Props = { urls: string[]; onChange: (urls: string[]) => void; error?: string };

/**
 * Photos by URL: paste a link, see it straight away, then reorder or remove. The first photo is the
 * cover (what guests see on cards). The backend stores the URLs as given, so a bad link is only
 * flagged here, not blocked — "couldn't load" tells the host to check it.
 */
export function PhotoEditor({ urls, onChange, error }: Props) {
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const valid = isHttpUrl(draft);

  const add = () => {
    const url = draft.trim();
    if (!isHttpUrl(url)) return setDraftError("Paste a full image link starting with http:// or https://");
    if (urls.includes(url)) return setDraftError("That photo is already added.");
    if (urls.length >= LIMITS.images.max) return setDraftError(`You can add up to ${LIMITS.images.max} photos.`);
    onChange([...urls, url]);
    setDraft("");
    setDraftError(null);
  };

  const move = (from: number, to: number) => {
    const next = [...urls];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div id="field-image_urls">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <label htmlFor="photo-url" className="mb-2 block text-sm font-medium">
            Photo link
          </label>
          <input
            id="photo-url"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setDraftError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Enter adds the photo instead of submitting the whole form
                add();
              }
            }}
            placeholder="https://images.unsplash.com/photo-…"
            className={`w-full rounded-xl border bg-white px-4 py-3.5 text-base outline-none placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_1px_#222] ${draftError ? "border-[#C13515]" : "border-line-strong"}`}
          />
          <ErrorText>{draftError ?? undefined}</ErrorText>
        </div>
        <button type="button" onClick={add} className="h-[54px] shrink-0 self-end rounded-xl bg-ink px-6 text-base font-semibold text-white hover:bg-black sm:mb-0">
          Add photo
        </button>
      </div>

      {/* Live preview of the link being typed */}
      {valid && (
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-subtle p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs */}
          <img src={draft.trim()} alt="Preview of the link you typed" className="h-16 w-24 rounded-lg bg-line-light object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.2")} />
          <p className="text-sm text-muted">Preview — press “Add photo” to include it.</p>
        </div>
      )}

      <ErrorText>{error}</ErrorText>

      {urls.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {urls.map((url, i) => (
            <li key={url} className="group relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-line-light">
                {broken.has(url) ? (
                  <div className="grid h-full place-items-center p-3 text-center text-xs text-muted">
                    <span>
                      <ImageOff className="mx-auto mb-1" size={20} />
                      Couldn’t load this image. Check the link.
                    </span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- host photos come from arbitrary URLs
                  <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" onError={() => setBroken((b) => new Set(b).add(url))} />
                )}
                {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-white px-2 py-1 text-xs font-semibold shadow-badge">Cover photo</span>}
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => onChange(urls.filter((u) => u !== url))}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white shadow-badge hover:scale-105"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>{i + 1} of {urls.length}</span>
                <span className="flex gap-1">
                  <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, i - 1)} className="grid h-7 w-7 place-items-center rounded-full border border-line-strong hover:border-ink disabled:opacity-30">
                    <ArrowLeft size={13} />
                  </button>
                  <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === urls.length - 1} onClick={() => move(i, i + 1)} className="grid h-7 w-7 place-items-center rounded-full border border-line-strong hover:border-ink disabled:opacity-30">
                    <ArrowRight size={13} />
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
