export type SettledMilestoneFlags = {
  approved?: boolean;
  released?: boolean;
  resolved?: boolean;
};

export type SettledMilestoneLike = {
  flags?: SettledMilestoneFlags;
  /** Single-release milestones store approved at the top level. */
  approved?: boolean;
};

/**
 * True when every milestone is approved and either released or resolved.
 * Empty milestone lists are not considered settled.
 */
export function areAllMilestonesSettled(
  milestones: SettledMilestoneLike[],
): boolean {
  if (milestones.length === 0) {
    return false;
  }

  return milestones.every((milestone) => {
    const approved = milestone.flags?.approved ?? milestone.approved;
    const released = milestone.flags?.released === true;
    const resolved = milestone.flags?.resolved === true;
    return Boolean(approved) && (released || resolved);
  });
}
