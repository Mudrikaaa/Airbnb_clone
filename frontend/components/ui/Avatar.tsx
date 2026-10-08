import type { UserSummary } from "@/lib/types";

/** Round profile photo, or Airbnb's dark circle with the first initial when there's no photo. */
export function Avatar({ user, size = 32 }: { user: UserSummary; size?: number }) {
  if (user.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element -- avatars come from arbitrary URLs
    return <img src={user.avatar_url} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-ink font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
}
