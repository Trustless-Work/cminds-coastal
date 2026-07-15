import { cn } from "@repo/ui/lib/utils";

const STELLAR_URL = "https://stellar.org";
const TRUSTLESS_WORK_URL = "https://www.trustlesswork.com";
const ESCROW_VIEWER_URL = "https://viewer.trustlesswork.com";

const DEFAULT_STELLAR_LOGO = "/stellar.png";
const DEFAULT_TRUSTLESS_WORK_LOGO = "/trustless-work.png";

const linkClassName =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type SiteFooterProps = {
  logoSrc?: string;
  logoAlt?: string;
  brandName?: string;
  tagline?: string;
  stellarLogoSrc?: string;
  trustlessWorkLogoSrc?: string;
  className?: string;
};

const ABOUT_LINKS: FooterLink[] = [
  {
    href: "https://docs.trustlesswork.com",
    label: "Trustless Work docs",
    external: true,
  },
  {
    href: "https://developers.stellar.org",
    label: "Stellar developers",
    external: true,
  },
  {
    href: ESCROW_VIEWER_URL,
    label: "Escrow Viewer",
    external: true,
  },
];

function FooterAnchor({ href, label, external }: FooterLink) {
  return (
    <a
      href={href}
      className={linkClassName}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
    >
      {label}
    </a>
  );
}

export function SiteFooter({
  logoSrc,
  logoAlt = "CMinds",
  brandName = "CMinds",
  tagline = "Role-based escrow for community-led coastal conservation on Stellar.",
  stellarLogoSrc = DEFAULT_STELLAR_LOGO,
  trustlessWorkLogoSrc = DEFAULT_TRUSTLESS_WORK_LOGO,
  className,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-auto w-full border-t border-border bg-background-secondary",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1320px] px-6 py-12 sm:px-10 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-5">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-8 w-auto self-start object-contain sm:h-9"
              />
            ) : (
              <span className="text-xl font-bold tracking-tight text-foreground">
                {brandName}
              </span>
            )}
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {tagline}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Coastal Communities Escrow Pilot — transparent milestones, public
              progress, and USDC settlement without a custodian.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-3">
            <p className="text-sm font-semibold text-foreground">Platform</p>
            <ul className="flex flex-col gap-3">
              <li className="text-sm text-muted-foreground">
                Community create & release
              </li>
              <li className="text-sm text-muted-foreground">
                CMinds review & approval
              </li>
              <li className="text-sm text-muted-foreground">
                Funding with USDC
              </li>
              <li className="text-sm text-muted-foreground">
                Public transparency
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-4">
            <p className="text-sm font-semibold text-foreground">Resources</p>
            <ul className="flex flex-col gap-3">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterAnchor {...link} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-8 border-t border-border pt-8 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div className="flex items-center gap-6 sm:gap-8">
            <a
              href={TRUSTLESS_WORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Trustless Work"
              className="inline-flex size-11 shrink-0 items-center justify-center transition-opacity hover:opacity-70 sm:size-12"
            >
              <img
                src={trustlessWorkLogoSrc}
                alt=""
                className="size-full object-contain"
              />
            </a>

            <span
              className="h-8 w-px shrink-0 bg-border sm:h-10"
              aria-hidden
            />

            <a
              href={STELLAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Stellar"
              className="inline-flex h-11 shrink-0 items-center transition-opacity hover:opacity-70 sm:h-12"
            >
              <img
                src={stellarLogoSrc}
                alt=""
                className="h-6 w-auto max-w-[148px] object-contain object-left sm:h-7 sm:max-w-[168px]"
              />
            </a>
          </div>

          <p className="text-sm text-muted-foreground sm:text-right">
            © {year} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
