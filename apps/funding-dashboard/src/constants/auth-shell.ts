/** Shared AuthGate chrome for every funding-dashboard page. */
export const FUNDING_AUTH_SHELL = {
  appRole: "FUNDER" as const,
  appTitle: "CMinds",
  logoSrc: "/logos/dark-en-logo.png",
  logoHref: "/dashboard",
  navLinks: [
    { href: "/dashboard", label: "Escrows" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
};
