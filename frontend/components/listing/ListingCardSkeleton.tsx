/** Grey placeholder in the card's exact shape (airbnb.com shows the same while loading). */
export function ListingCardSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="aspect-[20/19] rounded-card bg-line-light" />
      <div className="mt-3 h-4 w-3/5 rounded bg-line-light" />
      <div className="mt-2 h-4 w-4/5 rounded bg-line-light" />
      <div className="mt-2 h-4 w-2/5 rounded bg-line-light" />
    </div>
  );
}
