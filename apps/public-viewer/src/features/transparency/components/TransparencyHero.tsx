"use client";

import Image from "next/image";
import type { ReactNode } from "react";

type TransparencyHeroProps = {
  headline?: string;
  imageSrc?: string;
  imageAlt?: string;
  children?: ReactNode;
};

export const TransparencyHero = ({
  headline = "Coastal Progress",
  imageSrc = "/assets/hero.webp",
  imageAlt = "Mangrove shoreline at sunrise — coastal conservation transparency",
  children,
}: TransparencyHeroProps) => {
  return (
    <div>
      <div className="relative h-[420px] overflow-hidden rounded-[32px] sm:h-[560px] md:h-[600px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 1320px) 100vw, 1320px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <h1 className="text-center text-5xl font-bold tracking-[0.04em] text-white sm:text-7xl md:text-[88px]">
            {headline}
          </h1>
        </div>
      </div>

      {children ? (
        <div className="relative z-10 mx-auto -mt-8 w-full max-w-4xl sm:-mt-10">
          {children}
        </div>
      ) : null}
    </div>
  );
};
