import Link from "next/link";

const STEPS = [
  { title: "Tell us about your place", text: "Share some basic info, like where it is and how many guests can stay." },
  { title: "Make it stand out", text: "Add amenities and photos, plus a title and description – we’ll help you out." },
  { title: "Finish up and publish", text: "Set a nightly price and publish your listing when you’re ready." },
];

/**
 * Intro for users without listings. Layout measured on airbnb.co.in/become-a-host at 1440px: two 580px
 * columns 90px apart, both centred in the window; 72px/600 headline (-2.88px tracking), 18px grey
 * subtitle, a 405×56 pill; on the right a 580×596 card with 64px corners on a soft pink.
 * The card lists our three steps instead of Airbnb's photo / video.
 */
export function BecomeAHostIntro() {
  return (
    // Centred in the whole window like Airbnb (the 104px top bar overlaps the empty top area).
    <main className="pointer-events-none px-6 pb-16 md:-mt-[104px] md:flex md:min-h-screen md:items-center md:justify-center md:pb-0">
      <div className="pointer-events-auto grid w-full max-w-[1250px] items-center gap-12 md:grid-cols-2 md:gap-[90px]">
        <div className="mx-auto flex max-w-[580px] flex-col items-center text-center">
          <h1 className="text-5xl font-semibold leading-[1.03] tracking-[-0.04em] md:text-[72px] md:leading-[74px] md:tracking-[-2.88px]">
            It’s easy to get started on Airbnb
          </h1>
          <p className="mt-6 max-w-[385px] text-lg leading-6 text-muted">
            List your place in three short steps. You can change everything later.
          </p>
          <Link
            href="/become-a-host/steps"
            className="mt-12 flex h-14 w-full max-w-[405px] items-center justify-center rounded-[42px] bg-brand-gradient text-base font-semibold text-white hover:brightness-95"
          >
            Get started
          </Link>
          <p className="mt-8 text-base text-muted">
            Not listing a home? Host an{" "}
            <Link href="/experiences" className="font-medium text-ink underline">
              experience or service
            </Link>
            .
          </p>
        </div>

        <ol className="mx-auto flex w-full max-w-[580px] flex-col justify-center gap-10 rounded-[40px] bg-[linear-gradient(160deg,#FFF5F8_0%,#FCE4EC_100%)] px-10 py-14 md:min-h-[596px] md:rounded-[64px] md:px-14">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[22px] font-semibold shadow-badge">{i + 1}</span>
              <div>
                <h2 className="text-[22px] font-semibold leading-[26px]">{s.title}</h2>
                <p className="mt-2 text-lg leading-6 text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
