// Which pages hide parts of the global page chrome (header variants, footer, phone tab bar).

export const isCheckout = (pathname: string) => pathname.startsWith("/book/");

/** The create / edit listing pages and "become a host": Airbnb shows a bare "logo … Exit" bar and no footer. */
export const isHostForm = (pathname: string) =>
  pathname.startsWith("/become-a-host") ||
  pathname === "/hosting/listings/new" || /^\/hosting\/listings\/[^/]+\/edit$/.test(pathname);

/** Everything under /hosting that isn't the form: dashboard with the host header. */
export const isHostDashboard = (pathname: string) => pathname.startsWith("/hosting") && !isHostForm(pathname);
