"use client";

import Image from "next/image";

type CommunityBannerProps = {
  headline?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export const CommunityBanner = ({
  headline = "Your Coastal Work",
  imageSrc = "/assets/hero.webp",
  imageAlt = "Coastal community conservation",
}: CommunityBannerProps) => {
  return (
    <div className="relative h-44 overflow-hidden rounded-[24px] sm:h-52 md:h-56">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 1320px) 100vw, 1320px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/35" aria-hidden />
      <div className="absolute inset-0 flex items-end px-6 pb-6 sm:px-8 sm:pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {headline}
        </h1>
      </div>
    </div>
  );
};
