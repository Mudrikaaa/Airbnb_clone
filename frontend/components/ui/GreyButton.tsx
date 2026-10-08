/** Airbnb's secondary button ("Show more", "Show all amenities", "Message host"): #F2F2F2, 12px radius, 16px/500, 48px tall. */
export function GreyButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      className={`h-12 rounded-xl bg-chip px-6 text-base font-medium text-ink transition-colors hover:bg-[#EBEBEB] ${className}`}
    />
  );
}
