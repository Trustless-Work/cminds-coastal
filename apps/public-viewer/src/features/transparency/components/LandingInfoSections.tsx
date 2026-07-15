"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, FolderKanban, HandCoins } from "lucide-react";

import {
  LANDING_FEATURES,
  LANDING_STEPS,
  type LandingFeature,
  type LandingStepId,
} from "../constants/landing";
import { DuotoneIcon } from "./DuotoneIcon";
import { StellarLink, TrustlessWorkLink } from "./BrandTextLink";

const STEP_ICONS: Record<LandingStepId, LucideIcon> = {
  create: FolderKanban,
  review: ClipboardCheck,
  release: HandCoins,
};

function featureDescription(feature: LandingFeature): ReactNode {
  if (feature.id === "onchain") {
    return (
      <>
        Each project lives on <StellarLink /> via <TrustlessWorkLink />.{" "}
        {feature.description}
      </>
    );
  }

  return feature.description;
}

export const LandingInfoSections = () => {
  return (
    <div className="mt-20 flex flex-col gap-20 sm:mt-28 sm:gap-28">
      <section className="flex flex-col gap-10 sm:gap-14">
        <header className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            How it works
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            From task to release
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            A simple escrow loop for coastal communities — visible to funders,
            partners, and the public without signing in.
          </p>
        </header>

        <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {LANDING_STEPS.map((item, index) => {
            const style: CSSProperties = {
              animationDelay: `${index * 80}ms`,
            };
            return (
              <li
                key={item.step}
                style={style}
                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex flex-col gap-5 rounded-[24px] border border-border bg-background p-6 duration-500 sm:gap-6 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <DuotoneIcon
                    icon={STEP_ICONS[item.id]}
                    sizeClassName="size-14 sm:size-16"
                  />
                  <span className="text-sm font-semibold tracking-wide text-muted-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="flex flex-col gap-10 sm:gap-14">
        <header className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            What you can see
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Built for open oversight
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Status, milestones, evidence, and funding progress stay readable —
            the same story communities and CMinds work through every day.
          </p>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
          {LANDING_FEATURES.map((feature, index) => {
            const style: CSSProperties = {
              animationDelay: `${index * 80}ms`,
            };
            return (
              <article
                key={feature.id}
                style={style}
                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both group flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-border bg-background p-3 duration-500 sm:p-4"
              >
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-background-secondary">
                  <Image
                    src={feature.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 flex min-w-0 flex-col gap-2 px-1 pb-1 sm:mt-4">
                  <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {featureDescription(feature)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-border bg-background-secondary">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[280px] lg:min-h-[420px]">
            <Image
              src="/assets/hero.webp"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-5 px-8 py-12 sm:px-12 sm:py-16">
            <p className="text-sm font-medium text-muted-foreground">
              Coastal Communities Escrow Pilot
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Transparency without an account
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              This public viewer is for observers — foundations, partners, and
              anyone following coastal work. No sign-in. Browse initialized
              escrows above, open a project for milestone detail, and follow
              progress as funds move milestone by milestone.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <TrustlessWorkLink /> is never custodian of funds. Escrows settle
              on <StellarLink /> with USDC.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
