export type LandingFeature = {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
};

export type LandingStepId = "create" | "review" | "release";

export type LandingStep = {
  id: LandingStepId;
  step: string;
  title: string;
  description: string;
};

export const LANDING_STEPS: LandingStep[] = [
  {
    id: "create",
    step: "01",
    title: "Communities create escrows",
    description:
      "Coastal communities select tasks from a fixed menu, assign milestone amounts in USDC, and initialize an on-chain contract.",
  },
  {
    id: "review",
    step: "02",
    title: "Work is reviewed in public",
    description:
      "Evidence links and milestone status update as work progresses. CMinds approves or requests help on each milestone independently.",
  },
  {
    id: "release",
    step: "03",
    title: "Funds release with a trail",
    description:
      "After approval, a community release signer disburses funds per milestone. Observers can follow funded and released amounts.",
  },
];

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: "evidence",
    imageSrc: "/assets/card-01.webp",
    title: "Evidence you can verify",
    description:
      "Milestones include public evidence links — photos, reports, minutes, and other deliverables agreed with the community.",
  },
  {
    id: "community",
    imageSrc: "/assets/card-02.webp",
    title: "Community-led conservation",
    description:
      "Tasks come from a fixed coastal menu: coordination, participation, advocacy, information, and visibility work that communities already do.",
  },
  {
    id: "onchain",
    imageSrc: "/assets/card-03.webp",
    title: "On-chain USDC escrows",
    description:
      "Shortened addresses, balances, and release history stay readable for any observer.",
  },
];

export const FALLBACK_COVERS = [
  "/assets/card-01.webp",
  "/assets/card-02.webp",
  "/assets/card-03.webp",
] as const;
