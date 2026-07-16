export type SettledMilestoneFlags = {
  approved?: boolean;
  released?: boolean;
  resolved?: boolean;
  disputed?: boolean;
};

export type SettledMilestoneLike = {
  flags?: SettledMilestoneFlags;
  /** Single-release milestones store approved at the top level. */
  approved?: boolean;
  /** Indexer status text — used as fallback when flags are sparse. */
  status?: string;
};

function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 1 || value === "true";
}

/**
 * True when every milestone is released or resolved (terminal outcomes).
 * Also treats status text as a fallback when flags are missing from indexer data.
 * Empty milestone lists are not considered settled.
 */
export function areAllMilestonesSettled(
  milestones: SettledMilestoneLike[],
): boolean {
  if (milestones.length === 0) {
    return false;
  }

  return milestones.every((milestone) => {
    const released = isTruthyFlag(milestone.flags?.released);
    const resolved = isTruthyFlag(milestone.flags?.resolved);
    if (released || resolved) {
      return true;
    }

    const status = (milestone.status ?? "").toUpperCase();
    if (status.includes("RELEASED") || status.includes("RESOLVED")) {
      return true;
    }

    // Single-release milestones have no released/resolved flags.
    if (milestone.flags === undefined) {
      return isTruthyFlag(milestone.approved);
    }
    return false;
  });
}

/**
 * Merge indexer + local optimistic milestone flags so settle checks see
 * released/resolved from either source.
 */
export function mergeMilestonesForSettleCheck(
  primary: SettledMilestoneLike[] | undefined,
  secondary: SettledMilestoneLike[] | undefined,
): SettledMilestoneLike[] {
  const base = primary?.length ? primary : (secondary ?? []);
  const other = primary?.length ? secondary : undefined;
  if (!other?.length) {
    return base;
  }

  return base.map((milestone, index) => {
    const alt = other[index];
    if (!alt) return milestone;
    return {
      ...milestone,
      approved: isTruthyFlag(milestone.approved) || isTruthyFlag(alt.approved),
      flags: {
        ...milestone.flags,
        ...alt.flags,
        released:
          isTruthyFlag(milestone.flags?.released) ||
          isTruthyFlag(alt.flags?.released),
        resolved:
          isTruthyFlag(milestone.flags?.resolved) ||
          isTruthyFlag(alt.flags?.resolved),
        approved:
          isTruthyFlag(milestone.flags?.approved) ||
          isTruthyFlag(alt.flags?.approved),
        disputed:
          isTruthyFlag(alt.flags?.disputed) ||
          isTruthyFlag(milestone.flags?.disputed),
      },
    };
  });
}
