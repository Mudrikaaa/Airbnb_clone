/** Placeholder in the listing page's shape while it loads. */
export function DetailSkeleton() {
  const bar = "animate-pulse rounded bg-line-light";
  return (
    <div aria-hidden className="mx-auto max-w-[1200px] px-6 md:px-10">
      <div className={`mt-6 hidden h-8 w-1/2 md:block ${bar}`} />
      <div className="mt-6 aspect-[4/3] animate-pulse bg-line-light md:aspect-[1120/476] md:rounded-xl" />
      <div className="mt-8 flex gap-[8.4%]">
        <div className="flex-1 space-y-3 lg:max-w-[58.3%]">
          <div className={`h-6 w-2/3 ${bar}`} />
          <div className={`h-4 w-1/2 ${bar}`} />
          <div className={`mt-8 h-20 w-full ${bar}`} />
          <div className={`h-40 w-full ${bar}`} />
        </div>
        <div className={`hidden h-72 w-[33.3%] lg:block ${bar} !rounded-xl`} />
      </div>
    </div>
  );
}
